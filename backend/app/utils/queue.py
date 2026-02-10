import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Dict, Any
import time

from app.services.ml_service import ml_service
from app.services.cloudinary_service import cloudinary_service

ml_queue: asyncio.Queue[bytes] = asyncio.Queue()
ml_semaphore = asyncio.Semaphore(3)  # max 3 concurrent predictions

# Thread pool for blocking I/O (Cloudinary)
_executor = ThreadPoolExecutor(max_workers=4)

queue_stats: Dict[str, Any] = {
    "total_processed": 0,
    "currently_processing": 0,
    "queued": 0,
    "requests": {},  # request_id -> status dict
}


async def process_ml_prediction(request_id: str, contents: bytes) -> Dict[str, Any]:
    """
    Optimized pipeline: runs Cloudinary upload IN PARALLEL with ML analysis.
    """
    async with ml_semaphore:
        queue_stats["currently_processing"] += 1
        queue_stats["requests"][request_id] = {
            "status": "processing",
            "started_at": datetime.now().isoformat(),
        }
        timings: Dict[str, float] = {}
        pipeline_start = time.perf_counter()

        try:
            loop = asyncio.get_event_loop()

            # ── Run Cloudinary upload and ML analysis in PARALLEL ──
            upload_task = loop.run_in_executor(
                _executor, cloudinary_service.upload_image, contents
            )
            ml_task = loop.run_in_executor(
                _executor, ml_service.analyze_image, contents
            )

            # Wait for both to complete
            upload_result, result = await asyncio.gather(upload_task, ml_task)

            timings["total"] = round(time.perf_counter() - pipeline_start, 3)

            queue_stats["requests"][request_id] = {
                "status": "completed",
                "started_at": queue_stats["requests"][request_id]["started_at"],
                "completed_at": datetime.now().isoformat(),
                "timings": timings,
            }
            queue_stats["total_processed"] += 1

            return {
                "status": "success",
                "analysis": result,
                "upload_info": upload_result,
                "request_id": request_id,
                "timings": timings,
            }
        except Exception as e:
            queue_stats["requests"][request_id] = {
                "status": "error",
                "error": str(e),
                "started_at": queue_stats["requests"][request_id]["started_at"],
                "completed_at": datetime.now().isoformat(),
            }
            raise
        finally:
            queue_stats["currently_processing"] -= 1
            if len(queue_stats["requests"]) > 100:
                oldest = min(
                    queue_stats["requests"].keys(),
                    key=lambda k: queue_stats["requests"][k].get("started_at", ""),
                )
                del queue_stats["requests"][oldest]
                del queue_stats["requests"][oldest]

def get_queue_status() -> Dict[str, Any]:
    queue_stats["queued"] = ml_queue.qsize()
    return {
        "queue_status": {
            "currently_processing": queue_stats["currently_processing"],
            "queued": queue_stats["queued"],
            "max_concurrent": 3,
            "total_processed": queue_stats["total_processed"],
        },
        "recent_requests": dict(list(queue_stats["requests"].items())[-10:]),
        "timestamp": datetime.now().isoformat(),
    }