# SingleHTML5Generator

Generates single index.html from Cocos Creator project<br/>
Based on https://github.com/mrsep18th/single_html5_generator and https://github.com/revelatiosgn/SingleHTML5Generator

CocosCreator version 3.0.0. You also need Python3

Instructions:
1. Copy build-templates and html_generator to your project folder
2. Build cocos project with settings:<br/>
platform: Web Mobile<br/>
Inline all SpriteFrames: uncheck
3. Run html_generator/generate_single_html.py (or call "py html_generator/generate_single_html.py True" to compress images with tinify)
4. Result: html_generator/index.html
