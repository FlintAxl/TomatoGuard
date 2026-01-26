"""
Comprehensive Tomato Disease Recommendations Database
Based on agricultural best practices and expert guidelines
"""

RECOMMENDATIONS_DB = {
    'leaf': {
        'Septoria Leaf Spot': {
            'description': 'Fungal disease causing small, circular spots with gray centers and dark borders. Spots may merge causing large necrotic areas.',
            'causal_agent': 'Septoria lycopersici (fungus)',
            'immediate': [
                'Remove infected leaves immediately and destroy them (do not compost)',
                'Apply fungicide containing chlorothalonil or mancozeb',
                'Stop overhead watering to reduce leaf wetness',
                'Improve air circulation around plants'
            ],
            'prevention': [
                'Practice 3-4 year crop rotation with non-solanaceous crops',
                'Space plants 18-24 inches apart for better air flow',
                'Water at soil level using drip irrigation',
                'Use certified disease-free seeds and transplants',
                'Remove plant debris at end of season'
            ],
            'organic': [
                'Apply copper-based fungicide every 7-10 days',
                'Baking soda spray (1 tbsp baking soda + 1 tsp horticultural oil + 1 gallon water)',
                'Neem oil application every 7-14 days',
                'Biofungicides containing Bacillus subtilis'
            ],
            'chemical': [
                'Chlorothalonil (Bravo, Daconil) - apply every 7-10 days',
                'Azoxystrobin (Heritage) - systemic fungicide',
                'Mancozeb (Dithane) - protectant fungicide'
            ],
            'monitoring': 'Check lower leaves first, disease progresses upward'
        },
        
        'Bacterial Spot': {
            'description': 'Bacterial infection causing small, water-soaked spots that become angular with yellow halos. Leaves may yellow and drop.',
            'causal_agent': 'Xanthomonas species (bacteria)',
            'immediate': [
                'Remove severely infected plants to prevent spread',
                'Apply copper-based bactericide mixed with mancozeb',
                'Avoid working with plants when foliage is wet',
                'Disinfect tools with 10% bleach solution'
            ],
            'prevention': [
                'Use certified disease-free seeds (hot water treated at 122°F for 25 minutes)',
                'Avoid overhead irrigation',
                'Provide good drainage',
                'Rotate with non-host crops for 2-3 years'
            ],
            'organic': [
                'Copper hydroxide sprays every 5-7 days during wet weather',
                'Streptomycin sulfate (Agri-mycin) if available',
                'Plant resistance inducers like harpin protein'
            ],
            'chemical': [
                'Copper hydroxide (Kocide) + mancozeb for best control',
                'Oxytetracycline (Mycoshield) in rotation',
                'Acibenzolar-S-methyl (Actigard) for systemic resistance'
            ],
            'monitoring': 'Warm (75-86°F), wet conditions favor disease'
        },
        
        'Early Blight': {
            'description': 'Fungal disease causing target-like rings on leaves with concentric circles. Lower leaves affected first.',
            'causal_agent': 'Alternaria solani (fungus)',
            'immediate': [
                'Remove infected lower leaves',
                'Apply fungicide at first symptoms',
                'Mulch to prevent soil splash',
                'Improve plant nutrition (avoid high nitrogen)'
            ],
            'prevention': [
                'Use resistant varieties (Mountain series, Defiant)',
                'Maintain proper plant spacing',
                'Stake plants for better air circulation',
                'Remove volunteer tomatoes and nightshade weeds'
            ],
            'organic': [
                'Copper fungicides applied preventatively',
                'Bacillus subtilis (Serenade) every 7 days',
                'Compost tea foliar sprays',
                'Potassium bicarbonate sprays'
            ],
            'chemical': [
                'Chlorothalonil (Bravo) every 7-10 days',
                'Azoxystrobin (Quadris) - systemic',
                'Pyraclostrobin + boscalid (Pristine)'
            ],
            'monitoring': 'Symptoms appear after flowering, worse in warm, humid weather'
        },
        
        'Late Blight': {
            'description': 'Devastating fungal disease causing large, irregular water-soaked lesions that rapidly expand. White fungal growth may appear on underside.',
            'causal_agent': 'Phytophthora infestans (water mold)',
            'immediate': [
                'DESTROY infected plants immediately - do not compost',
                'Apply fungicide within 24 hours of detection',
                'Isolate area to prevent spore spread',
                'Notify nearby growers if in commercial setting'
            ],
            'prevention': [
                'Plant resistant varieties (Mountain Magic, Defiant)',
                'Avoid planting near potatoes',
                'Use drip irrigation only',
                'Apply preventative fungicides during cool, wet periods'
            ],
            'organic': [
                'Copper fungicides every 5-7 days during high risk',
                'Potassium phosphite sprays',
                'Biofungicides containing Trichoderma'
            ],
            'chemical': [
                'Chlorothalonil (Bravo Weather Stik) - protectant',
                'Mandipropamid (Revus) - systemic',
                'Fluopicolide (Presidio) - for resistant strains'
            ],
            'monitoring': 'HIGH ALERT during cool (60-75°F), wet weather. Can destroy crop in days.'
        },
        
        'Yellow Leaf Curl': {
            'description': 'Viral disease causing upward curling of leaves, yellowing, and stunted growth. Transmitted by whiteflies.',
            'causal_agent': 'Tomato yellow leaf curl virus (TYLCV)',
            'immediate': [
                'Remove and destroy infected plants',
                'Control whitefly populations immediately',
                'Use reflective mulches to repel whiteflies',
                'Apply systemic insecticides if whiteflies present'
            ],
            'prevention': [
                'Use resistant varieties (Tyking, Shanty, Tygress)',
                'Install insect-proof netting (50 mesh)',
                'Remove weed hosts (nightshade family)',
                'Monitor whitefly populations with yellow sticky traps'
            ],
            'organic': [
                'Neem oil or insecticidal soap for whiteflies',
                'Beauveria bassiana fungal pathogen for whiteflies',
                'Companion planting with marigolds or basil'
            ],
            'chemical': [
                'Imidacloprid (Admire) - systemic for whiteflies',
                'Dinotefuran (Venom) for resistant whiteflies',
                'Pyriproxyfen (Knack) - insect growth regulator'
            ],
            'monitoring': 'Watch for whiteflies and leaf curling symptoms'
        },
        
        'Healthy': {
            'description': 'Plant appears healthy with no disease symptoms observed.',
            'maintenance': [
                'Continue regular watering (1-2 inches per week)',
                'Apply balanced fertilizer (5-10-10) monthly',
                'Monitor for pests and diseases weekly',
                'Prune suckers for better air circulation'
            ],
            'prevention': [
                'Rotate planting location annually',
                'Use disease-resistant varieties',
                'Maintain soil pH 6.0-6.8',
                'Test soil nutrients annually'
            ],
            'tips': [
                'Water in morning to allow leaves to dry',
                'Mulch with straw or plastic to prevent soil splash',
                'Stake or cage plants for support',
                'Remove yellowing leaves promptly'
            ]
        }
    },
    
    'fruit': {
        'Anthracnose': {
            'description': 'Fungal disease causing sunken, circular, water-soaked spots on ripe fruits. Centers may develop black fungal structures.',
            'causal_agent': 'Colletotrichum species (fungus)',
            'immediate': [
                'Harvest fruits at first sign of ripening',
                'Remove and destroy infected fruits',
                'Apply fungicide to protect remaining fruits',
                'Avoid harvesting when plants are wet'
            ],
            'prevention': [
                'Use resistant varieties when available',
                'Stake plants to keep fruits off ground',
                'Mulch with straw or plastic',
                'Practice 3-year crop rotation'
            ],
            'organic': [
                'Copper fungicides applied when fruits begin to form',
                'Bacillus subtilis (Serenade) every 7-10 days',
                'Remove plant debris after harvest'
            ],
            'chemical': [
                'Chlorothalonil applied during fruit development',
                'Azoxystrobin (Quadris) - systemic protection',
                'Pyraclostrobin (Cabrio) for severe cases'
            ],
            'harvest': 'Harvest fruits at mature green or breaker stage, avoid overripe fruits on plant'
        },
        
        'Botrytis Gray Mold': {
            'description': 'Fungal disease causing gray, fuzzy mold on fruits, typically starting at blossom end or injuries.',
            'causal_agent': 'Botrytis cinerea (fungus)',
            'immediate': [
                'Remove infected fruits immediately',
                'Improve air circulation',
                'Reduce humidity around plants',
                'Remove spent blossoms and senescent tissues'
            ],
            'prevention': [
                'Avoid wounding fruits during handling',
                'Space plants adequately',
                'Water early in day',
                'Remove old flowers and leaves'
            ],
            'organic': [
                'Bicarbonate sprays (potassium bicarbonate)',
                'Biofungicides (Bacillus subtilis, Trichoderma)',
                'Proper sanitation - clean tools and containers'
            ],
            'chemical': [
                'Iprodione (Rovral) - labeled for Botrytis',
                'Cyprodinil + fludioxonil (Switch)',
                'Fenhexamid (Elevate)'
            ],
            'storage': 'Store fruits in cool, dry conditions; check regularly for mold'
        },
        
        'Blossom End Rot': {
            'description': 'Physiological disorder (not disease) causing dark, sunken leathery patches at blossom end of fruit. Caused by calcium deficiency and/or irregular watering.',
            'causal_agent': 'Calcium deficiency/water stress',
            'immediate': [
                'Maintain consistent soil moisture',
                'Apply calcium nitrate foliar spray (2 tbsp/gallon)',
                'Mulch to retain soil moisture',
                'Avoid excessive nitrogen fertilization'
            ],
            'prevention': [
                'Test soil and adjust pH to 6.5-6.8 for calcium availability',
                'Incorporate gypsum or lime before planting if calcium deficient',
                'Use consistent watering schedule (1-2 inches/week)',
                'Avoid root damage from cultivation'
            ],
            'organic': [
                'Add crushed eggshells or bone meal to soil',
                'Use compost rich in calcium',
                'Foliar calcium sprays from seaweed or calcium chloride',
                'Maintain even soil moisture with drip irrigation'
            ],
            'chemical': [
                'Calcium nitrate foliar spray every 7-10 days',
                'Calcium chloride spray (follow label directions)',
                'Avoid ammonium-based fertilizers which inhibit calcium uptake'
            ],
            'note': 'Affects first fruit clusters most; later fruits usually normal if corrected'
        },
        
        'Buckeye Rot': {
            'description': 'Soil-borne disease causing brown, concentric rings on fruits touching soil. Caused by water mold, not true fungus.',
            'causal_agent': 'Phytophthora species (water mold)',
            'immediate': [
                'Remove infected fruits',
                'Stake plants to keep fruits off ground',
                'Apply mulch barrier',
                'Improve drainage in planting area'
            ],
            'prevention': [
                'Use plastic mulch to prevent soil contact',
                'Practice 4-year crop rotation',
                'Avoid overwatering',
                'Plant in raised beds for better drainage'
            ],
            'organic': [
                'Copper fungicides as preventative',
                'Biofungicides containing Trichoderma or Gliocladium',
                'Solarize soil before planting in hot climates'
            ],
            'chemical': [
                'Mefenoxam (Ridomil Gold) - soil drench at planting',
                'Phosphorous acid fungicides',
                'Chlorothalonil for fruit protection'
            ],
            'harvest': 'Harvest fruits before they touch ground; affects only fruits in contact with soil'
        },
        
        'Healthy': {
            'description': 'Fruits appear healthy, properly developed, and free from disease symptoms.',
            'maintenance': [
                'Continue consistent watering',
                'Support heavy fruit clusters',
                'Harvest at proper maturity stage',
                'Monitor for pests like hornworms'
            ],
            'harvest_tips': [
                'Harvest when fruits show full color',
                'Twist gently to avoid stem damage',
                'Harvest in cool morning hours',
                'Store at 55-70°F for best flavor'
            ],
            'quality': [
                'Expect 60-85 days from transplant to harvest',
                'Fruits should be firm but yield to gentle pressure',
                'Color should be uniform based on variety',
                'Avoid harvesting in extreme heat'
            ]
        },

                'Sunscald': {
            'description': 'Sunscald is a physiological disorder caused by excessive exposure to direct sunlight, resulting in discolored, sunken areas on fruits.',
            'maintenance': [
                'shade fruits during peak sunlight hours using shade cloths or plant covers',
                'ensure adequate watering to reduce plant stress',
                'support heavy fruit clusters',
                'harvest at proper maturity stage',
            ],
            'harvest_tips': [
                'Harvest when fruits show full color',
                'Twist gently to avoid stem damage',
                'Harvest in cool morning hours',
                'Store at 55-70°F for best flavor'
            ],
            'quality': [
                'Expect 60-85 days from transplant to harvest',
                'Fruits should be firm but yield to gentle pressure',
                'Color should be uniform based on variety',
                'Avoid harvesting in extreme heat'
            ]
        }
    },
    
    'stem': {
        'Wilt': {
            'description': 'Fungal diseases (Fusarium or Verticillium) causing yellowing, wilting, and vascular discoloration. Plants may die gradually.',
            'causal_agent': 'Fusarium oxysporum or Verticillium dahliae (fungi)',
            'immediate': [
                'Remove and destroy infected plants',
                'Solarize soil for 4-6 weeks in hot season',
                'Do not compost infected plants',
                'Disinfect tools after use'
            ],
            'prevention': [
                'Use resistant varieties (VF or VFN indicated on seed packet)',
                'Practice 5-7 year crop rotation with non-host crops',
                'Avoid planting in infected soil',
                'Maintain soil pH above 6.5'
            ],
            'organic': [
                'Biofumigation with mustard cover crops',
                'Solarization with clear plastic for 6-8 weeks',
                'Add organic matter to improve soil health',
                'Biofungicides containing Trichoderma or Gliocladium'
            ],
            'chemical': [
                'Soil fumigants (only for commercial use with certification)',
                'Chloropicrin or metam sodium if available',
                'Preventative soil drenches for high-value crops'
            ],
            'diagnosis': 'Cut stem - brown vascular tissue indicates Fusarium/Verticillium wilt'
        },
        
        'Blight': {
            'description': 'Stem blight causing dark, sunken cankers on stems, often near soil line. May girdle and kill plant.',
            'causal_agent': 'Various fungi including Didymella, Phoma',
            'immediate': [
                'Remove infected plants or prune affected stems',
                'Apply fungicide to protect remaining plants',
                'Avoid wounding stems during cultivation',
                'Improve drainage'
            ],
            'prevention': [
                'Use disease-free transplants',
                'Avoid overwatering',
                'Rotate planting locations',
                'Remove plant debris after harvest'
            ],
            'organic': [
                'Copper fungicide sprays on stems',
                'Biofungicides containing Bacillus or Trichoderma',
                'Proper sanitation of tools and equipment'
            ],
            'chemical': [
                'Chlorothalonil for stem protection',
                'Azoxystrobin for systemic protection',
                'Mancozeb as protectant fungicide'
            ],
            'note': 'Often enters through wounds or pruning cuts'
        },
        
        'Healthy': {
            'description': 'Stems appear healthy, strong, and free from disease symptoms.',
            'maintenance': [
                'Provide adequate support for plant growth',
                'Prune selectively for air circulation',
                'Monitor for signs of stress or damage',
                'Protect from mechanical injury'
            ],
            'care': [
                'Tie stems loosely to stakes',
                'Remove suckers below first flower cluster',
                'Avoid damaging stems during cultivation',
                'Monitor for boring insects'
            ]
        }
    }
}

def get_recommendations(plant_part: str, disease: str, confidence: float) -> dict:
    """
    Get comprehensive recommendations based on plant part and disease
    
    Args:
        plant_part: 'leaf', 'fruit', or 'stem'
        disease: Name of disease detected
        confidence: Model confidence score (0-1)
    
    Returns:
        dict: Comprehensive recommendations including treatment options
    """
    
    # Default recommendations if disease not found in database
    default_recs = {
        'description': 'Specific information for this condition is not available in our database.',
        'immediate': [
            'Monitor plant closely for symptom progression',
            'Take clear photos from multiple angles for expert consultation',
            'Isolate plant if possible to prevent potential spread',
            'Consider soil testing to check nutrient imbalances'
        ],
        'general_tips': [
            'Maintain consistent watering schedule (1-2 inches per week)',
            'Ensure proper plant spacing for air circulation',
            'Remove plant debris and weeds regularly',
            'Use drip irrigation to keep foliage dry'
        ],
        'when_to_consult': [
            'Symptoms worsen within 3-5 days',
            'Multiple plants show similar symptoms',
            'Previous treatments are ineffective',
            'For commercial crops: consult agricultural extension immediately'
        ]
    }
    
    # Get specific recommendations from database
    specific_recs = RECOMMENDATIONS_DB.get(plant_part, {}).get(disease, default_recs)
    
    # Determine confidence level
    if confidence > 0.85:
        confidence_level = 'high'
        confidence_note = f'High confidence diagnosis ({confidence:.1%}) - proceed with recommended treatments'
    elif confidence > 0.65:
        confidence_level = 'moderate'
        confidence_note = f'Moderate confidence ({confidence:.1%}) - monitor closely and consider differential diagnosis'
    else:
        confidence_level = 'low'
        confidence_note = f'Low confidence ({confidence:.1%}) - verify diagnosis with additional photos or expert consultation'
    
    # Build comprehensive response
    result = {
        'disease': disease,
        'plant_part': plant_part,
        'confidence': {
            'score': confidence,
            'level': confidence_level,
            'note': confidence_note
        },
        'description': specific_recs.get('description', 'No description available'),
        'causal_agent': specific_recs.get('causal_agent', 'Unknown'),
        
        # Treatment recommendations (prioritized)
        'immediate_actions': specific_recs.get('immediate', default_recs['immediate']),
        'preventive_measures': specific_recs.get('prevention', []),
        'organic_options': specific_recs.get('organic', []),
        'chemical_options': specific_recs.get('chemical', []),
        
        # Additional info
        'monitoring_tips': specific_recs.get('monitoring', []),
        'general_care': specific_recs.get('general_tips', default_recs['general_tips']),
        'when_to_seek_help': default_recs['when_to_consult'],
        
        # Timing and next steps
        'expected_progression': 'Monitor for changes in 3-7 days',
        'reassessment_timeframe': 'Reassess in 5-7 days after treatment',
        'record_keeping': [
            'Take dated photos before and after treatment',
            'Note weather conditions and watering schedule',
            'Record any treatments applied'
        ]
    }
    
    # Add differential diagnosis for lower confidence or similar diseases
    if confidence_level != 'high':
        similar_diseases = get_similar_diseases(plant_part, disease)
        if similar_diseases:
            result['differential_diagnosis'] = similar_diseases
            result['note'] = 'Consider these similar conditions as alternative diagnoses'
    
    return result

def get_similar_diseases(plant_part: str, disease: str) -> list:
    """Get list of diseases that might be confused with the given disease"""
    
    similarity_groups = {
        'leaf': {
            'Early Blight': ['Late Blight', 'Septoria Leaf Spot', 'Bacterial Spot'],
            'Late Blight': ['Early Blight', 'Bacterial Spot'],
            'Septoria Leaf Spot': ['Early Blight', 'Bacterial Spot'],
            'Bacterial Spot': ['Septoria Leaf Spot', 'Early Blight'],
            'Yellow Leaf Curl': ['Nutrient deficiency', 'Herbicide damage']
        },
        'fruit': {
            'Anthracnose': ['Buckeye Rot', 'Sunscald'],
            'Buckeye Rot': ['Anthracnose', 'Blossom End Rot'],
            'Blossom End Rot': ['Buckeye Rot', 'Sunscald'],
            'Botrytis Gray Mold': ['Other fruit rots'],
            'Sunscald': ['Blossom End Rot', 'Anthracnose']
        },
        'stem': {
            'Wilt': ['Blight', 'Drought stress', 'Root rot'],
            'Blight': ['Wilt', 'Mechanical damage']
        }
    }
    
    return similarity_groups.get(plant_part, {}).get(disease, [])

# Quick test function
if __name__ == "__main__":
    # Test the recommendations
    test_cases = [
        ('leaf', 'Early Blight', 0.92),
        ('fruit', 'Blossom End Rot', 0.78),
        ('stem', 'Wilt', 0.45),
        ('leaf', 'Unknown Disease', 0.60)
    ]
    
    for part, disease, confidence in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing: {part.upper()} - {disease} (Confidence: {confidence:.0%})")
        print('='*60)
        
        recs = get_recommendations(part, disease, confidence)
        
        print(f"Description: {recs['description'][:100]}...")
        print(f"\nImmediate Actions:")
        for i, action in enumerate(recs['immediate_actions'][:3], 1):
            print(f"  {i}. {action}")
        
        if 'differential_diagnosis' in recs:
            print(f"\nAlso consider: {', '.join(recs['differential_diagnosis'])}")
        
        print(f"\nConfidence: {recs['confidence']['note']}")