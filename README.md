# MapMyVacation
Visualize Web Hosted photo albums with D3.js and some help from Deep CNNs.
[GitHub Pages Demo (in progress)](https://nate-russell.github.io/MapMyVacation/)
#### Usage
In my mind, this will be a dockerized program with a config file that points to your photos and it outputs a directory of files that can be used with the front end code to visualize/ interact with the photos

## Rough Plan
1. Build Thumbnail Library
    i. Get image thumbnails from imgur albums using [API](https://apidocs.imgur.com/#intro) ***or***
    ii. Traverse local image file directories and Post images to imgur
2. Visualize on a map
    1. Figure out where the photos should be on the map
        1. Most of my photos are on a DSLR camera without gps, but some are on a phone that does. I might be able to match up times and image content neighbors...
        2. But i know their will be images where there is simply no gps info so maybe some gui/automation to help specify GPS coordinates for photo blocks.
    2. Use D3.js to visualize and interact
        i. [Zoomable map](https://bl.ocks.org/mbostock/9656675)
        ii. [Points on map](https://bl.ocks.org/mbostock/9943478)
3. Visual Semantic Embedding inspired by [this](http://cs.stanford.edu/people/karpathy/cnnembed/)
    1. Use Tensorflow to get CNN codes
        i. [pre-trained models](https://github.com/tensorflow/models/tree/master/slim) would be easiest ***or***

        ii. if pre-trained models aren't sufficient then maybe a self-supervised in-painting model, split-brain autoencoder, GAN or VAE
    2. Use [largevis](https://github.com/lferry007/LargeVis) to get 2d coordinates
    3. USe D3.js to visualize and interact
        i. [zoomable scatterplot with mouseove](http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e)
        i. [pic inside circle](https://gist.github.com/procoder-net/11382664)





