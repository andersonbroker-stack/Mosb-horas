from PIL import Image
import os

def resize_image(input_path, output_path, size):
    with Image.open(input_path) as img:
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        img.save(output_path)
        print(f"Resized {input_path} to {size}x{size} and saved to {output_path}")

base_dir = "/home/ubuntu/pwa-mosb"
resize_image(os.path.join(base_dir, "icon-512.png"), os.path.join(base_dir, "icon-192.png"), 192)
resize_image(os.path.join(base_dir, "icon-maskable-512.png"), os.path.join(base_dir, "icon-maskable-192.png"), 192)
