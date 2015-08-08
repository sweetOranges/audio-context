/**
 * random create a number between m and n
 */
function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}

var player={

    audio:null,//audio element
    canvas:null,//canvas element

    ctx:null,//canvas context
    /**
     * The AudioContext interface represents an audio-processing
     * graph built from audio modules linked together, each represented
     * by an AudioNode. An audio context controls both the creation of
     * the nodes it contains and the execution of the audio processing,
     * or decoding. You need to create an AudioContext before you do anything else,
     * as everything happens inside a context.
     */
    audioContext:null,
    /**
     * It is an AudioNode that passes the audio stream
     * unchanged from the input to the output,but allows
     * you to take the generated data, process it, and
     * create audio visualizations.
     */
    analyserNode:null,
    /**
     * The GainNode interface represents a change in volume.
     * It is an AudioNode audio-processing module that causes a
     * given gain to be applied to the input data before its propagation
     * to the output.A GainNode always has exactly one input and one output,
     * both with the same number of channels.
     */
    gainNode:null,
    /**
     * Is an unsigned long value representing the size of the FFT
     * (Fast Fourier Transform) to be used to determine the frequency domain.
     */
    size:64,

    line:null,
    dots:[],
    width:0,
    height:0,


    init:function(){

        this.audio=document.getElementById('audio');
        this.canvas=document.getElementById('canvas');
        this.ctx=this.canvas.getContext('2d');
        this.width=this.canvas.width;
        this.height=this.canvas.height;

        this.audioContext=new (window.AudioContext||window.webkitAudioContext)();
        this.analyserNode=this.audioContext.createAnalyser();
        this.analyserNode.fftSize=this.size*2;
        this.gainNode=this.audioContext[this.audioContext.createGain?"createGain":"createGainNode"]();
        //Returns an AudioDestinationNode representing the final destination of
        // all audio in the context. It can be thought of as the audio-rendering device.
        this.gainNode.connect(this.audioContext.destination);
        //connect to the audio dom element
        this.audioContext.createMediaElementSource(this.audio).connect(this.analyserNode);
        this.analyserNode.connect(this.gainNode);

        this.createLine();
        this.createDots();


    },

    visualize:function(){
        //Is an unsigned long value half that of the FFT size.
        // This generally equates to the number of data values
        // you will have to play with for the visualization.
        var arr=new Uint8Array(this.analyserNode.frequencyBinCount);
        var requestAnimationFrame=window.requestAnimationFrame||
            window.webkitRequestAnimationFrame||
            window.mozRequestAnimationFrame;
        var self=this;
        var handler=setInterval(function(){
            requestAnimationFrame(function(){
                //Copies the current frequency data into a Uint8Array
                // (unsigned byte array) passed into it.
                self.analyserNode.getByteFrequencyData(arr);
                self.draw(arr);
            });
        },40);
    },

    draw:function(arr){
        //console.info(arr);
        this.ctx.clearRect(0, 0, this.width, this.height);
        var w = this.width / this.size;
        var cw = w * 0.6;
        var capH = cw;
        this.ctx.fillStyle = this.line;
        for (var i = 0; i < this.size; i++) {
            var h = arr[i] / 256 * (this.height);
            var o = this.dots[i];
            this.ctx.fillRect(w * i, this.height - h, cw, h);
            this.ctx.fillRect(w * i, this.height - (o.cap + capH), cw, capH);
            o.cap--;
            if (o.cap < 0)
                o.cap = 0;
            if (h > 0 && o.cap < (h + 40)) {
                o.cap = (h + 40 > this.height - capH) ? (this.height - capH)
                    : (h + 40);
            }
        }
    },
    createLine:function(){
        this.line = this.ctx.createLinearGradient(0, 0, 0, this.height);
        this.line.addColorStop(0, "red");
        this.line.addColorStop(0.5, "yellow");
        this.line.addColorStop(1, "green");
    },
    createDots:function(){
        this.dots = [];
        for (var i = 0; i < this.size; i++) {
            var x = random(0, this.width);
            var y = random(0, this.height);
            var color = "rgb(" + random(0, 255) + "," + random(0, 255) + ","
                + random(0, 255) + ")";
            this.dots.push({
                x : x,
                y : y,
                color : color,
                cap : 0
            });
        }
    }
}

window.addEventListener('load',function(){
    player.init();
    player.visualize();
});