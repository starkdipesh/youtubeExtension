#!/usr/bin/env python3
"""
Icon Generator for YouTube Channel Restrictor
Generates PNG icons in required sizes: 16x16, 48x48, 128x128
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon configurations
ICON_SIZES = {
    16: 'icon-16.png',
    48: 'icon-48.png',
    128: 'icon-128.png'
}

# Colors
GRADIENT_COLORS = {
    'start': (102, 126, 234),  # Purple-blue
    'end': (118, 75, 162),      # Purple
    'text': (255, 255, 255)     # White
}

def create_gradient_image(size):
    """Create an image with a gradient background"""
    image = Image.new('RGB', (size, size), GRADIENT_COLORS['start'])
    pixels = image.load()
    
    # Create a simple gradient
    for x in range(size):
        for y in range(size):
            # Calculate gradient factor
            factor = (x + y) / (2 * size)
            
            # Linear interpolation between start and end colors
            r = int(GRADIENT_COLORS['start'][0] * (1 - factor) + GRADIENT_COLORS['end'][0] * factor)
            g = int(GRADIENT_COLORS['start'][1] * (1 - factor) + GRADIENT_COLORS['end'][1] * factor)
            b = int(GRADIENT_COLORS['start'][2] * (1 - factor) + GRADIENT_COLORS['end'][2] * factor)
            
            pixels[x, y] = (r, g, b)
    
    return image

def draw_play_symbol(image, size):
    """Draw a play triangle symbol"""
    draw = ImageDraw.Draw(image)
    
    # Calculate triangle dimensions
    margin = size // 8
    left = margin
    top = margin
    right = size - margin
    bottom = size - margin
    
    # Play button triangle (pointing right)
    triangle_points = [
        (left, top),           # Top-left
        (left, bottom),        # Bottom-left
        (right, (top + bottom) // 2)  # Right point
    ]
    
    # Draw filled triangle
    draw.polygon(triangle_points, fill=GRADIENT_COLORS['text'])

def generate_icons():
    """Generate all required icon sizes"""
    icons_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("🎨 Generating extension icons...")
    
    for size, filename in ICON_SIZES.items():
        print(f"  Creating {size}x{size} icon ({filename})...", end=" ")
        
        # Create base image with gradient
        image = create_gradient_image(size)
        
        # Draw play symbol
        draw_play_symbol(image, size)
        
        # Save icon
        filepath = os.path.join(icons_dir, filename)
        image.save(filepath, 'PNG')
        
        print("✅")
    
    print("\n✨ Icons generated successfully!")
    print(f"   Location: {icons_dir}")
    print(f"   Files: {', '.join(ICON_SIZES.values())}")

if __name__ == '__main__':
    try:
        generate_icons()
    except ImportError:
        print("❌ Error: PIL/Pillow not installed")
        print("\n📦 Install with:")
        print("   pip install pillow")
        print("\n   Or use the online generator:")
        print("   https://www.iconify.design/")
    except Exception as e:
        print(f"❌ Error generating icons: {e}")
        print("\n💡 You can manually create PNG icons (16x16, 48x48, 128x128)")
        print("   and place them in this directory.")
