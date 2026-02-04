from typing import List, Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import logging

from app.models.analysis_model import (
    AnalysisRecord, 
    AnalysisCreate, 
    AnalysisResponse,
    AnalysisSearchFilters,
    AnalysisSummary,
    UserAnalysisStats
)

logger = logging.getLogger(__name__)

class AnalysisService:
    """Service for managing analysis records in MongoDB"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.analyses_collection = database.analyses
        self.users_collection = database.users
    
    async def create_indexes(self):
        """Create database indexes for performance"""
        try:
            # User-based indexes
            await self.analyses_collection.create_index([("user_id", 1)])
            await self.analyses_collection.create_index([("user_id", 1), ("created_at", -1)])
            await self.analyses_collection.create_index([("user_id", 1), ("is_favorite", -1)])
            
            # Search indexes
            await self.analyses_collection.create_index([("analysis_result.disease_detection.disease", 1)])
            await self.analyses_collection.create_index([("analysis_result.part_detection.part", 1)])
            await self.analyses_collection.create_index([("tags", 1)])
            
            # Text search index
            await self.analyses_collection.create_index([
                ("notes", "text"),
                ("tags", "text"),
                ("analysis_result.disease_detection.disease", "text"),
                ("analysis_result.part_detection.part", "text")
            ])
            
            logger.info("✅ Analysis database indexes created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create indexes: {e}")
    
    async def save_analysis(self, analysis_data: AnalysisCreate) -> AnalysisResponse:
        """Save a new analysis record to the database"""
        try:
            # Create analysis record
            analysis_record = AnalysisRecord(**analysis_data.dict())
            
            # Extract metadata from analysis result if available
            if 'model_info' in analysis_data.analysis_result:
                metadata_dict = {
                    'processing_time': analysis_data.analysis_result.get('performance', {}).get('total_processing_time'),
                    'model_version': analysis_data.analysis_result.get('model_info', {}).get('analysis_timestamp'),
                    'preprocessing_method': analysis_data.analysis_result.get('model_info', {}).get('preprocessing_method'),
                    'bounding_boxes_enabled': analysis_data.analysis_result.get('model_info', {}).get('bounding_boxes_enabled')
                }
                analysis_record.metadata = metadata_dict
            
            # Convert to dict for MongoDB
            analysis_dict = analysis_record.dict()
            analysis_dict.pop('id', None)  # Remove id field, MongoDB will generate
            
            # Insert into database
            result = await self.analyses_collection.insert_one(analysis_dict)
            
            # Get the inserted record
            created_analysis = await self.analyses_collection.find_one({"_id": result.inserted_id})
            
            if created_analysis:
                # Convert _id to id for Pydantic model
                created_analysis["id"] = str(created_analysis["_id"])
                del created_analysis["_id"]
                
                logger.info(f"✅ Analysis saved for user {analysis_data.user_id}")
                return AnalysisResponse(**created_analysis)
            else:
                raise Exception("Failed to retrieve created analysis")
                
        except Exception as e:
            logger.error(f"❌ Failed to save analysis: {e}")
            raise
    
    async def get_user_analyses(self, user_id: str, filters: AnalysisSearchFilters) -> List[AnalysisSummary]:
        """Get user's analyses with filtering and pagination"""
        try:
            # Build query
            query = {"user_id": user_id}
            
            # Apply filters
            if filters.disease:
                query["analysis_result.disease_detection.disease"] = filters.disease
            
            if filters.plant_part:
                query["analysis_result.part_detection.part"] = filters.plant_part
            
            if filters.is_favorite is not None:
                query["is_favorite"] = filters.is_favorite
            
            if filters.has_disease is not None:
                if filters.has_disease:
                    query["analysis_result.disease_detection.disease"] = {"$ne": "Healthy"}
                else:
                    query["analysis_result.disease_detection.disease"] = "Healthy"
            
            if filters.tags:
                query["tags"] = {"$in": filters.tags}
            
            # Date range filter
            date_filter = {}
            if filters.date_from:
                date_filter["$gte"] = filters.date_from
            if filters.date_to:
                date_filter["$lte"] = filters.date_to
            if date_filter:
                query["created_at"] = date_filter
            
            # Severity filter
            if filters.severity:
                query["analysis_result.spot_detection.severity.level"] = filters.severity
            
            # Build pipeline for summaries
            pipeline = [
                {"$match": query},
                {"$sort": {"created_at": -1}},
                {"$skip": filters.offset},
                {"$limit": filters.limit},
                {
                    "$project": {
                        "id": {"$toString": "$_id"},
                        "image_url": 1,
                        "disease": "$analysis_result.disease_detection.disease",
                        "confidence": "$analysis_result.disease_detection.confidence",
                        "plant_part": "$analysis_result.part_detection.part",
                        "severity": "$analysis_result.spot_detection.severity.level",
                        "created_at": 1,
                        "is_favorite": 1,
                        "notes": 1,
                        "tags": 1
                    }
                }
            ]
            
            cursor = self.analyses_collection.aggregate(pipeline)
            analyses = await cursor.to_list(length=filters.limit)
            
            return [AnalysisSummary(**analysis) for analysis in analyses]
            
        except Exception as e:
            logger.error(f"❌ Failed to get user analyses: {e}")
            raise
    
    async def get_analysis_by_id(self, analysis_id: str, user_id: str) -> Optional[AnalysisResponse]:
        """Get a specific analysis by ID (user-specific)"""
        try:
            # Convert string ID to ObjectId
            object_id = ObjectId(analysis_id)
            
            # Find analysis for this user
            analysis = await self.analyses_collection.find_one({
                "_id": object_id,
                "user_id": user_id
            })
            
            if analysis:
                # Convert _id to id for Pydantic model
                analysis["id"] = str(analysis["_id"])
                del analysis["_id"]
                return AnalysisResponse(**analysis)
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get analysis by ID: {e}")
            raise
    
    async def update_analysis(self, analysis_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[AnalysisResponse]:
        """Update an analysis record"""
        try:
            object_id = ObjectId(analysis_id)
            
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow()
            
            # Update the analysis
            result = await self.analyses_collection.update_one(
                {"_id": object_id, "user_id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Return updated analysis
                updated_analysis = await self.analyses_collection.find_one({
                    "_id": object_id,
                    "user_id": user_id
                })
                
                if updated_analysis:
                    # Convert _id to id for Pydantic model
                    updated_analysis["id"] = str(updated_analysis["_id"])
                    del updated_analysis["_id"]
                    return AnalysisResponse(**updated_analysis)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to update analysis: {e}")
            raise
    
    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """Delete an analysis record"""
        try:
            object_id = ObjectId(analysis_id)
            
            result = await self.analyses_collection.delete_one({
                "_id": object_id,
                "user_id": user_id
            })
            
            if result.deleted_count > 0:
                logger.info(f"✅ Analysis {analysis_id} deleted for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Failed to delete analysis: {e}")
            raise
    
    async def toggle_favorite(self, analysis_id: str, user_id: str) -> Optional[AnalysisResponse]:
        """Toggle favorite status of an analysis"""
        try:
            # Get current analysis
            analysis = await self.get_analysis_by_id(analysis_id, user_id)
            if not analysis:
                return None
            
            # Toggle favorite status
            new_favorite_status = not analysis.is_favorite
            
            # Update
            updated = await self.update_analysis(
                analysis_id, 
                user_id, 
                {"is_favorite": new_favorite_status}
            )
            
            return updated
            
        except Exception as e:
            logger.error(f"❌ Failed to toggle favorite: {e}")
            raise
    
    async def get_user_statistics(self, user_id: str) -> UserAnalysisStats:
        """Get comprehensive statistics for a user"""
        try:
            # Total analyses
            total_analyses = await self.analyses_collection.count_documents({"user_id": user_id})
            
            # Disease frequency aggregation
            disease_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": "$analysis_result.disease_detection.disease",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}}
            ]
            
            disease_cursor = self.analyses_collection.aggregate(disease_pipeline)
            disease_results = await disease_cursor.to_list(length=None)
            disease_frequency = {result["_id"]: result["count"] for result in disease_results}
            
            # Healthy vs diseased ratio
            healthy_count = disease_frequency.get("Healthy", 0)
            diseased_count = total_analyses - healthy_count
            healthy_vs_diseased_ratio = healthy_count / max(total_analyses, 1)
            
            # Most common diseases (excluding healthy)
            most_common_diseases = [
                {"disease": disease, "count": count}
                for disease, count in disease_frequency.items()
                if disease != "Healthy"
            ][:5]
            
            # Analyses by month
            monthly_pipeline = [
                {"$match": {"user_id": user_id}},
                {
                    "$group": {
                        "_id": {
                            "year": {"$year": "$created_at"},
                            "month": {"$month": "$created_at"}
                        },
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id.year": -1, "_id.month": -1}},
                {"$limit": 12}
            ]
            
            monthly_cursor = self.analyses_collection.aggregate(monthly_pipeline)
            monthly_results = await monthly_cursor.to_list(length=None)
            analyses_by_month = [
                {
                    "month": f"{result['_id']['year']}-{result['_id']['month']:02d}",
                    "count": result["count"]
                }
                for result in monthly_results
            ]
            
            # Favorite analyses count
            favorite_count = await self.analyses_collection.count_documents({
                "user_id": user_id,
                "is_favorite": True
            })
            
            # Average processing time
            avg_time_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": None,
                    "avg_time": {"$avg": "$metadata.processing_time"}
                }}
            ]
            
            avg_time_cursor = self.analyses_collection.aggregate(avg_time_pipeline)
            avg_time_result = await avg_time_cursor.to_list(length=1)
            average_processing_time = avg_time_result[0]["avg_time"] if avg_time_result else None
            
            # Most analyzed plant parts
            parts_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {
                    "_id": "$analysis_result.part_detection.part",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 5}
            ]
            
            parts_cursor = self.analyses_collection.aggregate(parts_pipeline)
            parts_results = await parts_cursor.to_list(length=None)
            most_analyzed_plant_parts = [
                {"part": result["_id"], "count": result["count"]}
                for result in parts_results
            ]
            
            # Severity distribution
            severity_pipeline = [
                {"$match": {"user_id": user_id}},
                {"$match": {"analysis_result.spot_detection.severity.level": {"$exists": true}}},
                {"$group": {
                    "_id": "$analysis_result.spot_detection.severity.level",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}}
            ]
            
            severity_cursor = self.analyses_collection.aggregate(severity_pipeline)
            severity_results = await severity_cursor.to_list(length=None)
            severity_distribution = {result["_id"]: result["count"] for result in severity_results}
            
            return UserAnalysisStats(
                total_analyses=total_analyses,
                disease_frequency=disease_frequency,
                healthy_vs_diseased_ratio=healthy_vs_diseased_ratio,
                most_common_diseases=most_common_diseases,
                analyses_by_month=analyses_by_month,
                favorite_analyses_count=favorite_count,
                average_processing_time=average_processing_time,
                most_analyzed_plant_parts=most_analyzed_plant_parts,
                severity_distribution=severity_distribution
            )
            
        except Exception as e:
            logger.error(f"❌ Failed to get user statistics: {e}")
            raise
    
    async def search_analyses(self, user_id: str, query: str, filters: AnalysisSearchFilters) -> List[AnalysisSummary]:
        """Search analyses by text query"""
        try:
            # Build text search query
            search_query = {
                "$text": {"$search": query},
                "user_id": user_id
            }
            
            # Apply additional filters
            if filters.is_favorite is not None:
                search_query["is_favorite"] = filters.is_favorite
            
            # Build pipeline
            pipeline = [
                {"$match": search_query},
                {"$sort": {"score": {"$meta": "textScore"}, "created_at": -1}},
                {"$skip": filters.offset},
                {"$limit": filters.limit},
                {
                    "$project": {
                        "id": {"$toString": "$_id"},
                        "image_url": 1,
                        "disease": "$analysis_result.disease_detection.disease",
                        "confidence": "$analysis_result.disease_detection.confidence",
                        "plant_part": "$analysis_result.part_detection.part",
                        "severity": "$analysis_result.spot_detection.severity.level",
                        "created_at": 1,
                        "is_favorite": 1,
                        "notes": 1,
                        "tags": 1,
                        "search_score": {"$meta": "textScore"}
                    }
                }
            ]
            
            cursor = self.analyses_collection.aggregate(pipeline)
            analyses = await cursor.to_list(length=filters.limit)
            
            return [AnalysisSummary(**analysis) for analysis in analyses]
            
        except Exception as e:
            logger.error(f"❌ Failed to search analyses: {e}")
            raise
