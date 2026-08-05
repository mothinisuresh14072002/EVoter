# Model Cards

## Face Detection

**Name**: SCRFD (Sample and Computation Redistributed Face Detection) / RetinaFace
**Source**: InsightFace (https://github.com/deepinsight/insightface)
**Version**: SCRFD 500M / RetinaFace ResNet50
**Format**: ONNX
**Description**: 
A highly efficient face detection model that provides precise bounding boxes and 5 facial landmarks (eyes, nose, mouth corners). It balances speed and accuracy, making it ideal for real-time webcam verification pipelines.

**Limitations**:
- Performance may degrade on extreme profile angles (faces turned more than 45 degrees).
- May struggle with heavy occlusion such as large sunglasses or thick face masks.
- Requires reasonably clear lighting for accurate landmark extraction.

## Face Embedding

**Name**: AdaFace (IR50) / ArcFace
**Source**: InsightFace / Custom
**Version**: IR50 (ResNet50 backbone)
**Format**: ONNX
**Description**: 
A deep learning model trained on large-scale face datasets. It extracts a normalized 512-dimensional feature vector from a tightly cropped and aligned face image. AdaFace is particularly effective because it dynamically adapts the margin based on image quality, providing robust recognition even for lower-quality images.

**Limitations**:
- Susceptible to major facial structure changes or extreme occlusions.
- Performance relies heavily on the input image being correctly aligned using 5-point facial landmarks prior to extraction.

## Anti-Spoofing (Liveness)

**Name**: Silent-Face Anti-Spoofing (FAS-Net)
**Source**: MiniFASNet / Custom
**Version**: 2.7
**Format**: ONNX
**Description**:
An active 2D anti-spoofing model that analyzes the context of the face bounding box (including background and spatial padding) to detect presentation attacks such as printed photos, phone screens, and video replays.

**Limitations**:
- **Does NOT block all spoof attacks.** It cannot detect highly sophisticated 3D silicone masks.
- Highly sensitive to lighting glare and harsh shadows, which may result in false rejections.
- This is a passive 2D check and is not a replacement for hardware 3D depth sensors or active challenge-response protocols.
