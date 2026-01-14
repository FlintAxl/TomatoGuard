# Simple recommendations dictionary
recommendations = {
    "early_blight": "Remove affected leaves, apply fungicide, monitor closely.",
    "late_blight": "Remove infected plants, apply fungicide, avoid overhead watering.",
    "bacterial_spot": "Remove infected leaves, apply copper-based spray, practice crop rotation.",
    "healthy": "No action needed.",
    "septoria_leaf_spot": "Remove infected leaves, apply fungicide, rotate crops.",

    "anthracnose": "Remove infected fruits, apply fungicide, avoid overhead watering.",
    "blossom_end_rot": "Check soil calcium, water evenly, remove affected fruits.",
    "buckeye_rot": "Remove infected fruits, avoid water splash, use fungicide.",
    "gray_mold": "Remove affected fruits, improve airflow, apply fungicide."
}

def get_recommendation(disease_name):
    return recommendations.get(disease_name, "No recommendation available.")
