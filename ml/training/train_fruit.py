import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

def create_fruit_model():
    """Create fruit disease model (6 classes)"""
    base_model = keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(6, activation='softmax')  # 5 fruit disease classes
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_fruit_model():
    """Train fruit disease model"""
    data_dir = "ml/data/processed_split/fruit"
    batch_size = 32
    img_size = (224, 224)
    
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        os.path.join(data_dir, 'train'),
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    val_generator = val_datagen.flow_from_directory(
        os.path.join(data_dir, 'val'),
        target_size=img_size,
        batch_size=batch_size,
        class_mode='categorical'
    )
    
    model = create_fruit_model()
    
    callbacks = [
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ModelCheckpoint(
            'ml/models/fruit_model.h5',
            save_best_only=True
        )
    ]
    
    history = model.fit(
        train_generator,
        epochs=30,
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    model.save('ml/models/fruit_model_final.h5')
    print("Fruit model training complete!")
    
    # Save class names
    class_names = list(train_generator.class_indices.keys())
    import json
    with open('ml/models/fruit_class_names.json', 'w') as f:
        json.dump(class_names, f)
    print(f"Class names saved: {class_names}")

if __name__ == "__main__":
    train_fruit_model()