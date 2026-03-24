import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

def create_disease_model(num_classes=6):
    """Create MobileNetV2 model for leaf disease classification"""
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
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train_leaf_model():
    """Train leaf disease model"""
    data_dir = "ml/data/processed_split/leaf"
    batch_size = 32
    img_size = (224, 224)
    
    # Data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.3,
        horizontal_flip=True,
        vertical_flip=True,
        brightness_range=[0.8, 1.2],
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
    
    # Create model
    model = create_disease_model(num_classes=6)
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            patience=7,
            restore_best_weights=True,
            monitor='val_accuracy'
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7
        ),
        keras.callbacks.ModelCheckpoint(
            'ml/models/leaf_model.h5',
            save_best_only=True,
            monitor='val_accuracy'
        )
    ]
    
    # Train
    history = model.fit(
        train_generator,
        epochs=30,
        validation_data=val_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    # Fine-tuning
    print("\nStarting fine-tuning...")
    base_model = model.layers[0]
    base_model.trainable = True
    
    # Fine-tune from this layer onwards
    fine_tune_at = 100
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.00001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history_fine = model.fit(
        train_generator,
        epochs=10,
        initial_epoch=history.epoch[-1],
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    model.save('ml/models/leaf_model_final.h5')
    print("Leaf model training complete!")

if __name__ == "__main__":
    train_leaf_model()