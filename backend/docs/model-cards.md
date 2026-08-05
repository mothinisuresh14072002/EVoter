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
