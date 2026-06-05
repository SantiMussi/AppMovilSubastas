from PIL import Image
import base64
import os

# Original image
image_path = r"C:\Users\nehue\AppMovilSubastas\Backend\setupqueries\Thunder Run.png"

# Output files
compressed_image_path = r"C:\Users\nehue\AppMovilSubastas\Backend\setupqueries\Thunder Run.jpg"
base64_txt_path = r"C:\Users\nehue\AppMovilSubastas\Backend\setupqueries\Thunder Run.txt"

# Settings
max_width = None # modificar con numeros para reducir el ancho
jpeg_quality = 95 # modificar para reducir la calidad

# Open image
img = Image.open(image_path).convert("RGB")

# Resize image while keeping proportions
if img.width > max_width:
    ratio = max_width / img.width
    new_height = int(img.height * ratio)
    img = img.resize((max_width, new_height))

# Save compressed JPG
img.save(compressed_image_path, "JPEG", quality=jpeg_quality, optimize=True)

# Convert compressed image to Base64
with open(compressed_image_path, "rb") as image_file:
    encoded = base64.b64encode(image_file.read()).decode("utf-8")

# Save Base64 into TXT
with open(base64_txt_path, "w", encoding="utf-8") as txt_file:
    txt_file.write(encoded)

# Optional info
original_size = os.path.getsize(image_path)
compressed_size = os.path.getsize(compressed_image_path)

print("Compressed image saved to:", compressed_image_path)
print("Base64 TXT saved to:", base64_txt_path)
print("Original image size:", original_size, "bytes")
print("Compressed image size:", compressed_size, "bytes")
print("Base64 length:", len(encoded))