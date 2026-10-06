import numpy as np

from backend.services.face_detection import _decode_scrfd


class FakeNet:
    def getUnconnectedOutLayersNames(self):
        return [
            "score_8",
            "score_16",
            "score_32",
            "bbox_8",
            "bbox_16",
            "bbox_32",
            "kps_8",
            "kps_16",
            "kps_32",
        ]


def _level(stride: int):
    cells = (640 // stride) * (640 // stride)
    anchors = cells * 2
    return (
        np.zeros((anchors, 1), dtype=np.float32),
        np.zeros((anchors, 4), dtype=np.float32),
        np.zeros((anchors, 10), dtype=np.float32),
    )


def test_scrfd_decoder_returns_face_for_confident_anchor():
    score8, box8, kps8 = _level(8)
    score16, box16, kps16 = _level(16)
    score32, box32, kps32 = _level(32)

    feature_width = 640 // 8
    row = 40
    col = 40
    anchor_index = (row * feature_width + col) * 2

    score8[anchor_index, 0] = 0.95
    box8[anchor_index] = [2.0, 2.0, 2.0, 2.0]

    outputs = [
        score8,
        score16,
        score32,
        box8,
        box16,
        box32,
        kps8,
        kps16,
        kps32,
    ]

    faces = _decode_scrfd(FakeNet(), outputs, 640, 640)

    assert len(faces) == 1
    face = faces[0]
    assert face.width == 32
    assert face.height == 32
    assert 300 <= face.x <= 320
    assert 300 <= face.y <= 320
    assert len(face.landmarks) == 5
