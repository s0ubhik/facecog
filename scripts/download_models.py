def download_models():
    print("[+] Checking VGG-Face Model...")
    from deepface.basemodels import VGGFace as vggface
    vggface.loadModel()


if __name__ == "__main__":
    download_models()
