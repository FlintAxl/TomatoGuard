"""
ML Analytics Service
Aggregates data from analyses collection for the admin dashboard.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

# All known diseases per model (used to guarantee 0-fill)
ALL_DISEASES = {
    "fruit": ["Anthracnose", "Botrytis Gray Mold", "Blossom End Rot", "Buckeye Rot", "Sunscald", "Healthy"],
    "leaf": ["Bacterial Spot", "Early Blight", "Late Blight", "Septoria Leaf Spot", "Yellow Leaf Curl", "Healthy"],
    "stem": ["Blight", "Wilt", "Healthy"],
}

# Static model evaluation metrics (from your ml/evaluation results)
MODEL_EVALUATION = {
    "fruit": {
        "accuracy": 0.9702,
        "loss": 0.0830,
        "avg_confidence": 0.9716,
        "per_class": {
            "Anthracnose":        {"precision": 0.97, "recall": 0.96, "f1": 0.97},
            "Blossom End Rot":    {"precision": 0.96, "recall": 0.95, "f1": 0.96},
            "Botrytis Gray Mold": {"precision": 0.95, "recall": 0.97, "f1": 0.96},
            "Buckeye Rot":        {"precision": 0.98, "recall": 0.98, "f1": 0.98},
            "Healthy":            {"precision": 0.99, "recall": 0.99, "f1": 0.99},
            "Sunscald":           {"precision": 0.97, "recall": 0.97, "f1": 0.97},
        },
    },
    "leaf": {
        "accuracy": 0.8915,
        "loss": 0.2872,
        "avg_confidence": None,
        "per_class": {
            "Bacterial Spot":     {"precision": 0.9720, "recall": 0.9179, "f1": 0.9442},
            "Early Blight":       {"precision": 0.8721, "recall": 0.5769, "f1": 0.6944},
            "Healthy":            {"precision": 0.9639, "recall": 0.9726, "f1": 0.9682},
            "Late Blight":        {"precision": 0.7714, "recall": 0.9450, "f1": 0.8494},
            "Septoria Leaf Spot": {"precision": 0.8406, "recall": 0.8959, "f1": 0.8674},
            "Yellow Leaf Curl":   {"precision": 0.9899, "recall": 0.9704, "f1": 0.9801},
        },
    },
    "stem": {
        "accuracy": 0.99,
        "loss": None,
        "avg_confidence": None,
        "per_class": {
            "Blight":   {"precision": 0.99, "recall": 0.99, "f1": 0.99},
            "Healthy":  {"precision": 0.99, "recall": 0.99, "f1": 0.99},
            "Wilt":     {"precision": 0.99, "recall": 0.99, "f1": 0.99},
        },
    },
    "part_classifier": {
        "accuracy": 0.999,
        "loss": None,
        "avg_confidence": None,
        "per_class": {
            "fruit": {"precision": 1.00, "recall": 1.00, "f1": 1.00},
            "leaf":  {"precision": 1.00, "recall": 1.00, "f1": 1.00},
            "stem":  {"precision": 1.00, "recall": 0.99, "f1": 1.00},
        },
    },
}


class AnalyticsService:
    """Aggregation queries for ML analytics dashboard"""

    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.analyses = database.analyses

    @staticmethod
    def _normalize_stage() -> dict:
        """
        Normalization stage that handles BOTH storage formats:
          • Upload route stores ML result under  analysis_result.analysis.*
          • URL    route stores ML result under  analysis_result.*
        This $addFields picks whichever path exists.
        """
        return {
            "$addFields": {
                "_disease": {
                    "$ifNull": [
                        "$analysis_result.analysis.disease_detection.disease",
                        "$analysis_result.disease_detection.disease",
                    ]
                },
                "_confidence": {
                    "$ifNull": [
                        "$analysis_result.analysis.disease_detection.confidence",
                        "$analysis_result.disease_detection.confidence",
                    ]
                },
                "_part": {
                    "$ifNull": [
                        "$analysis_result.analysis.part_detection.part",
                        "$analysis_result.part_detection.part",
                    ]
                },
            }
        }

    # ------------------------------------------------------------------
    # 1. Overview numbers
    # ------------------------------------------------------------------
    async def get_overview(self) -> Dict[str, Any]:
        """High-level KPIs for the overview cards."""
        try:
            total = await self.analyses.count_documents({})

            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_count = await self.analyses.count_documents({"created_at": {"$gte": today_start}})

            norm = self._normalize_stage()

            # Healthy count
            healthy_pipeline = [
                norm,
                {"$match": {"_disease": "Healthy"}},
                {"$count": "count"},
            ]
            healthy_result = await self.analyses.aggregate(healthy_pipeline).to_list(1)
            healthy = healthy_result[0]["count"] if healthy_result else 0
            diseased = total - healthy

            # Average confidence
            avg_conf_pipeline = [
                norm,
                {"$group": {
                    "_id": None,
                    "avg_confidence": {"$avg": "$_confidence"},
                }}
            ]
            avg_conf_result = await self.analyses.aggregate(avg_conf_pipeline).to_list(1)
            avg_confidence = avg_conf_result[0]["avg_confidence"] if avg_conf_result else 0

            # Low-confidence (< 0.6)
            low_conf_pipeline = [
                norm,
                {"$match": {"_confidence": {"$lt": 0.6}}},
                {"$count": "count"},
            ]
            low_conf_result = await self.analyses.aggregate(low_conf_pipeline).to_list(1)
            low_conf = low_conf_result[0]["count"] if low_conf_result else 0

            # High-confidence (>= 0.9)
            high_conf_pipeline = [
                norm,
                {"$match": {"_confidence": {"$gte": 0.9}}},
                {"$count": "count"},
            ]
            high_conf_result = await self.analyses.aggregate(high_conf_pipeline).to_list(1)
            high_conf = high_conf_result[0]["count"] if high_conf_result else 0

            return {
                "total_analyses": total,
                "today_analyses": today_count,
                "healthy_count": healthy,
                "diseased_count": diseased,
                "avg_confidence": round(avg_confidence, 4) if avg_confidence else 0,
                "low_confidence_count": low_conf,
                "high_confidence_count": high_conf,
            }
        except Exception as e:
            logger.error(f"❌ analytics overview failed: {e}")
            raise

    # ------------------------------------------------------------------
    # 2. Disease detection statistics (0-filled for every known disease)
    # ------------------------------------------------------------------
    async def get_disease_detection_stats(self) -> Dict[str, Any]:
        """Detection counts for every disease, grouped by plant part."""
        try:
            total = await self.analyses.count_documents({})

            pipeline = [
                self._normalize_stage(),
                {"$group": {
                    "_id": {
                        "part": "$_part",
                        "disease": "$_disease",
                    },
                    "count": {"$sum": 1},
                    "avg_confidence": {"$avg": "$_confidence"},
                }},
                {"$sort": {"count": -1}},
            ]
            raw = await self.analyses.aggregate(pipeline).to_list(length=None)

            # Index counts by (part, disease)
            counts_map: Dict[str, Dict[str, Dict[str, Any]]] = {}
            for r in raw:
                part = (r["_id"].get("part") or "unknown").lower()
                disease = r["_id"].get("disease") or "Unknown"
                counts_map.setdefault(part, {})[disease] = {
                    "count": r["count"],
                    "avg_confidence": round(r["avg_confidence"], 4) if r["avg_confidence"] else 0,
                }

            # Build 0-filled result
            result: Dict[str, List[Dict[str, Any]]] = {}
            for part, diseases in ALL_DISEASES.items():
                part_list = []
                for d in diseases:
                    data = counts_map.get(part, {}).get(d, {"count": 0, "avg_confidence": 0})
                    pct = round(data["count"] / total * 100, 2) if total > 0 else 0
                    part_list.append({
                        "disease": d,
                        "count": data["count"],
                        "percentage": pct,
                        "avg_confidence": data["avg_confidence"],
                    })
                result[part] = part_list

            return {"total": total, "by_part": result}
        except Exception as e:
            logger.error(f"❌ disease stats failed: {e}")
            raise

    # ------------------------------------------------------------------
    # 3. Model evaluation (static – from your training evaluation files)
    # ------------------------------------------------------------------
    def get_model_evaluation(self) -> Dict[str, Any]:
        """Return static model evaluation metrics."""
        # Overall weighted accuracy
        weights = {"fruit": 0.25, "leaf": 0.40, "stem": 0.20, "part_classifier": 0.15}
        overall = sum(
            MODEL_EVALUATION[m]["accuracy"] * w
            for m, w in weights.items()
            if MODEL_EVALUATION[m]["accuracy"] is not None
        )
        return {
            "overall_accuracy": round(overall, 4),
            "models": MODEL_EVALUATION,
        }

    # ------------------------------------------------------------------
    # 4. Detection trend – daily counts per model (last 30 days)
    # ------------------------------------------------------------------
    async def get_detection_trends(self, days: int = 30) -> Dict[str, Any]:
        """Daily analysis counts per plant part for the last N days."""
        try:
            since = datetime.utcnow() - timedelta(days=days)

            pipeline = [
                self._normalize_stage(),
                {"$match": {"created_at": {"$gte": since}}},
                {"$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                        "part": "$_part",
                    },
                    "count": {"$sum": 1},
                }},
                {"$sort": {"_id.date": 1}},
            ]
            raw = await self.analyses.aggregate(pipeline).to_list(length=None)

            # Build date-indexed structure
            all_dates = [(since + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days + 1)]
            parts = ["fruit", "leaf", "stem"]

            trends: Dict[str, List[Dict[str, Any]]] = {p: [] for p in parts}
            trends["total"] = []

            # Index raw data
            data_map: Dict[str, Dict[str, int]] = {}
            for r in raw:
                date = r["_id"]["date"]
                part = (r["_id"].get("part") or "unknown").lower()
                data_map.setdefault(date, {})[part] = r["count"]

            for date in all_dates:
                day_data = data_map.get(date, {})
                day_total = 0
                for p in parts:
                    c = day_data.get(p, 0)
                    trends[p].append({"date": date, "count": c})
                    day_total += c
                trends["total"].append({"date": date, "count": day_total})

            return {"days": days, "trends": trends}
        except Exception as e:
            logger.error(f"❌ detection trends failed: {e}")
            raise

    # ------------------------------------------------------------------
    # 5. Confidence distribution buckets
    # ------------------------------------------------------------------
    async def get_confidence_distribution(self) -> Dict[str, Any]:
        """Bucket confidences and per-disease avg confidence."""
        try:
            norm = self._normalize_stage()

            # Buckets
            bucket_pipeline = [
                norm,
                {"$bucket": {
                    "groupBy": "$_confidence",
                    "boundaries": [0, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1.01],
                    "default": "unknown",
                    "output": {"count": {"$sum": 1}},
                }}
            ]
            buckets_raw = await self.analyses.aggregate(bucket_pipeline).to_list(length=None)

            labels = ["0-30%", "30-50%", "50-60%", "60-70%", "70-80%", "80-90%", "90-100%"]
            boundaries = [0, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9]
            buckets = []
            bucket_map = {r["_id"]: r["count"] for r in buckets_raw if r["_id"] != "unknown"}
            for i, b in enumerate(boundaries):
                buckets.append({"label": labels[i], "count": bucket_map.get(b, 0)})

            # Per-disease average confidence
            per_disease_pipeline = [
                norm,
                {"$group": {
                    "_id": "$_disease",
                    "avg_confidence": {"$avg": "$_confidence"},
                    "count": {"$sum": 1},
                }},
                {"$sort": {"avg_confidence": -1}},
            ]
            per_disease_raw = await self.analyses.aggregate(per_disease_pipeline).to_list(length=None)
            per_disease = [
                {
                    "disease": r["_id"],
                    "avg_confidence": round(r["avg_confidence"], 4) if r["avg_confidence"] else 0,
                    "count": r["count"],
                }
                for r in per_disease_raw
            ]

            return {"buckets": buckets, "per_disease": per_disease}
        except Exception as e:
            logger.error(f"❌ confidence distribution failed: {e}")
            raise

    # ------------------------------------------------------------------
    # 6. Plant part distribution
    # ------------------------------------------------------------------
    async def get_part_distribution(self) -> List[Dict[str, Any]]:
        """Count of analyses per plant part."""
        try:
            pipeline = [
                self._normalize_stage(),
                {"$group": {
                    "_id": "$_part",
                    "count": {"$sum": 1},
                }},
                {"$sort": {"count": -1}},
            ]
            raw = await self.analyses.aggregate(pipeline).to_list(length=None)

            total = sum(r["count"] for r in raw) if raw else 0
            parts = ["fruit", "leaf", "stem"]
            part_map = {(r["_id"] or "unknown").lower(): r["count"] for r in raw}

            return [
                {
                    "part": p,
                    "count": part_map.get(p, 0),
                    "percentage": round(part_map.get(p, 0) / total * 100, 2) if total > 0 else 0,
                }
                for p in parts
            ]
        except Exception as e:
            logger.error(f"❌ part distribution failed: {e}")
            raise

    # ------------------------------------------------------------------
    # 8. Recent analyses feed
    # ------------------------------------------------------------------
    async def get_recent_analyses(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Last N analyses with key fields."""
        try:
            pipeline = [
                self._normalize_stage(),
                {"$sort": {"created_at": -1}},
                {"$limit": limit},
                {"$project": {
                    "id": {"$toString": "$_id"},
                    "user_id": 1,
                    "image_url": 1,
                    "disease": "$_disease",
                    "confidence": "$_confidence",
                    "plant_part": "$_part",
                    "created_at": 1,
                }},
            ]
            results = await self.analyses.aggregate(pipeline).to_list(length=limit)
            for r in results:
                r.pop("_id", None)
                if r.get("created_at"):
                    r["created_at"] = r["created_at"].isoformat()
            return results
        except Exception as e:
            logger.error(f"❌ recent analyses failed: {e}")
            raise

    async def get_analysis_history(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """Paginated analysis history for admin dashboard."""
        try:
            skip = (page - 1) * page_size
            total = await self.analyses.count_documents({})

            pipeline = [
                self._normalize_stage(),
                {"$sort": {"created_at": -1}},
                {"$skip": skip},
                {"$limit": page_size},
                {"$project": {
                    "id": {"$toString": "$_id"},
                    "user_id": 1,
                    "image_url": 1,
                    "disease": "$_disease",
                    "confidence": "$_confidence",
                    "plant_part": "$_part",
                    "created_at": 1,
                }},
            ]
            results = await self.analyses.aggregate(pipeline).to_list(length=page_size)
            for r in results:
                r.pop("_id", None)
                if r.get("created_at"):
                    r["created_at"] = r["created_at"].isoformat()

            return {
                "analyses": results,
                "total": total,
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
            }
        except Exception as e:
            logger.error(f"❌ analysis history failed: {e}")
            raise

    async def get_analysis_detail(self, analysis_id: str) -> Dict[str, Any]:
        """Get full analysis detail by ID, including spot detection images."""
        try:
            from bson import ObjectId
            doc = await self.analyses.find_one({"_id": ObjectId(analysis_id)})
            if not doc:
                return None

            result = doc.get("analysis_result", {})

            # Handle both storage formats:
            # Upload route stores under analysis_result.analysis.*
            # URL route stores under analysis_result.*
            analysis = result.get("analysis", result)

            disease_detection = analysis.get("disease_detection", {})
            part_detection = analysis.get("part_detection", {})
            spot_detection = analysis.get("spot_detection", {}) or {}

            annotated_image = spot_detection.get("annotated_image")
            original_image = spot_detection.get("original_image")

            logger.info(f"📋 Analysis detail for {analysis_id}: "
                        f"has_analysis_key={'analysis' in result}, "
                        f"spot_detection_keys={list(spot_detection.keys()) if spot_detection else 'None'}, "
                        f"has_annotated={annotated_image is not None and len(str(annotated_image)) > 0}, "
                        f"has_original={original_image is not None and len(str(original_image)) > 0}, "
                        f"annotated_len={len(str(annotated_image)) if annotated_image else 0}, "
                        f"original_len={len(str(original_image)) if original_image else 0}")

            return {
                "id": str(doc["_id"]),
                "user_id": doc.get("user_id"),
                "image_url": doc.get("image_url", ""),
                "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
                "disease": disease_detection.get("disease", "Unknown"),
                "confidence": disease_detection.get("confidence", 0),
                "plant_part": part_detection.get("part", "unknown"),
                "part_confidence": part_detection.get("confidence", 0),
                "annotated_image": annotated_image,
                "original_image": original_image,
                "total_spots": spot_detection.get("total_spots", 0),
                "bounding_boxes": spot_detection.get("bounding_boxes", []),
                "alternative_predictions": disease_detection.get("alternative_predictions", []),
                "alternative_parts": part_detection.get("alternative_parts", []),
            }
        except Exception as e:
            logger.error(f"❌ analysis detail failed: {e}")
            raise

    async def get_scatter_plot_data(self, limit: int = 500) -> List[Dict[str, Any]]:
        """Get individual analysis points for scatter plot visualization."""
        try:
            pipeline = [
                self._normalize_stage(),
                {"$match": {
                    "_confidence": {"$exists": True, "$ne": None},
                    "_disease": {"$exists": True, "$ne": None},
                    "_part": {"$exists": True, "$ne": None}
                }},
                {"$sort": {"created_at": -1}},
                {"$limit": limit},
                {"$project": {
                    "id": {"$toString": "$_id"},
                    "disease": "$_disease",
                    "confidence": "$_confidence",
                    "plant_part": "$_part",
                    "created_at": 1,
                    "days_ago": {
                        "$divide": [
                            {"$subtract": ["$$NOW", "$created_at"]},
                            86400000  # Convert milliseconds to days
                        ]
                    }
                }},
            ]
            results = await self.analyses.aggregate(pipeline).to_list(length=limit)
            for r in results:
                r.pop("_id", None)
                if r.get("created_at"):
                    r["created_at"] = r["created_at"].isoformat()
                # Round days_ago to 2 decimal places
                if r.get("days_ago") is not None:
                    r["days_ago"] = round(r["days_ago"], 2)
            return results
        except Exception as e:
            logger.error(f"❌ scatter plot data failed: {e}")
            return []

    # ------------------------------------------------------------------
    # Combined endpoint – returns everything in one call
    # ------------------------------------------------------------------
    async def get_full_ml_analytics(self, trend_days: int = 30) -> Dict[str, Any]:
        """Aggregate all ML analytics into a single response."""
        overview = await self.get_overview()
        disease_stats = await self.get_disease_detection_stats()
        model_eval = self.get_model_evaluation()
        trends = await self.get_detection_trends(days=trend_days)
        confidence = await self.get_confidence_distribution()
        parts = await self.get_part_distribution()
        recent = await self.get_recent_analyses()
        scatter_data = await self.get_scatter_plot_data()

        return {
            "overview": overview,
            "disease_stats": disease_stats,
            "model_evaluation": model_eval,
            "detection_trends": trends,
            "confidence_distribution": confidence,
            "part_distribution": parts,
            "recent_analyses": recent,
            "scatter_plot_data": scatter_data,
        }
