# Everyday One Motion - 20160428 "眠い \#2"  

![](20160428.gif)  

JavaScript, WebGL, GPGPU Particle  

[Everyday One Motion](http://motions.work/motion/210)  
[Demo Page](http://fms-cat.github.io/eom_20160428)  

## 眠い

前回の眠いはこちらです。  
http://240x240.tumblr.com/post/92632709995

## Shadow

今回ははじめて影を実装しました。  
ポリゴンを用いたCG世界において物体に影を落とすには、光源からシーン全体を見た時におけるデプスバッファを作り、実際にレンダリングする際にそのデプスバッファと比較をする、という処理が必要となります。  
簡単に言い換えれば、 **面倒** です。レイトレーシング・レイマーチングが恋しくなるひとときでした。  
