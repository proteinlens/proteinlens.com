# Mermaid Diagram Export Guide

This guide explains how to generate high-quality SVG and PNG images from the architecture diagram.

## Option 1: Using Mermaid CLI (Recommended for High Quality)

### Install Mermaid CLI

```bash
npm install -g @mermaid-js/mermaid-cli
```

### Export to SVG (Scalable Vector - Best for Presentations)

```bash
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.svg --width 1920 --height 1440
```

### Export to PNG (Raster - Best for Web)

```bash
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --width 1920 --height 1440
```

### Export Both with Custom Theme

```bash
# High resolution SVG
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram-hq.svg --width 2400 --height 1800 --scale 2

# High resolution PNG
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram-hq.png --width 2400 --height 1800 --scale 2
```

## Option 2: Using Docker (No Local Installation)

### Export to SVG

```bash
docker run --rm -v $(pwd):/data minlag/mermaid-cli:latest -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.svg --width 1920 --height 1440
```

### Export to PNG

```bash
docker run --rm -v $(pwd):/data minlag/mermaid-cli:latest -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --width 1920 --height 1440
```

## Option 3: Using Online Mermaid Editor

1. Visit [https://mermaid.live](https://mermaid.live)
2. Copy the mermaid code from the diagram section
3. Paste it into the editor
4. Use the download button to export as SVG or PNG

## Option 4: Using VS Code Extension

1. Install the "Markdown Preview Mermaid Support" extension
2. Open [ARCHITECTURE-DIAGRAM.md](ARCHITECTURE-DIAGRAM.md)
3. Preview the diagram (Ctrl+Shift+V)
4. Right-click on the diagram and select "Save as SVG" or "Save as PNG"

## Recommended Settings for Investor Presentations

### High Quality Export Command

```bash
# Create investor-ready diagrams
mmdc -i docs/ARCHITECTURE-DIAGRAM.md \
  -o docs/architecture-diagram-investor.svg \
  --width 2560 --height 1920 --scale 2 --backgroundColor white

mmdc -i docs/ARCHITECTURE-DIAGRAM.md \
  -o docs/architecture-diagram-investor.png \
  --width 2560 --height 1920 --scale 2 --backgroundColor white
```

### For Presentations

```bash
# Wide format (16:9) suitable for projectors
mmdc -i docs/ARCHITECTURE-DIAGRAM.md \
  -o docs/architecture-diagram-presentation.svg \
  --width 1920 --height 1080 --scale 2

mmdc -i docs/ARCHITECTURE-DIAGRAM.md \
  -o docs/architecture-diagram-presentation.png \
  --width 1920 --height 1080 --scale 2
```

## File Format Recommendations

| Format | Best For | Resolution | File Size |
|--------|----------|------------|-----------|
| **SVG** | Web, Presentations, Scaling | Unlimited | 50-150 KB |
| **PNG** | Documents, Email, Social Media | 1920x1440 | 200-500 KB |

### SVG Advantages
- Scalable to any size without quality loss
- Smaller file size
- Can be edited with any text editor
- Perfect for web and responsive design

### PNG Advantages
- Compatible with all applications
- Better for documents and PDFs
- No special viewers required
- Suitable for email and social sharing

## Exporting with Custom Styling

Create a custom configuration file for better styling:

```bash
# Create a mermaid config file
cat > mermaid-config.json << 'EOF'
{
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#e1f5ff",
    "primaryTextColor": "#000",
    "primaryBorderColor": "#01579b",
    "lineColor": "#5f7161",
    "secondaryColor": "#fff3e0",
    "tertiaryColor": "#f3e5f5"
  },
  "flowchart": {
    "htmlLabels": true,
    "curve": "basis"
  }
}
EOF

# Use the config file
mmdc -i docs/ARCHITECTURE-DIAGRAM.md \
  -o docs/architecture-diagram.svg \
  -C mermaid-config.json \
  --width 2560 --height 1920 --scale 2
```

## Integration with CI/CD

Add to your Azure Pipeline or GitHub Actions to auto-generate diagrams:

### GitHub Actions Example

```yaml
- name: Generate Architecture Diagrams
  uses: mermaid-js/mermaid-cli-action@v1
  with:
    files: docs/ARCHITECTURE-DIAGRAM.md
    output: docs
    theme: default
    width: 2560
    height: 1920
```

## Troubleshooting

### Issue: Command not found

**Solution**: Install globally or use npx
```bash
npx @mermaid-js/mermaid-cli -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.svg
```

### Issue: Image is too small or blurry

**Solution**: Increase width/height and scale
```bash
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --width 3840 --height 2160 --scale 2
```

### Issue: Colors don't look right

**Solution**: Specify background color
```bash
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --backgroundColor white
```

## Quick Reference

```bash
# Most common: High-quality investor presentation
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --width 2560 --height 1920 --scale 2

# SVG for web
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.svg --width 2560 --height 1920 --scale 2

# Both formats at once
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.svg --width 2560 --height 1920 --scale 2 && \
mmdc -i docs/ARCHITECTURE-DIAGRAM.md -o docs/architecture-diagram.png --width 2560 --height 1920 --scale 2
```
