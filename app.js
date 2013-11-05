$(function() {

  var SoundIO = {};

  SoundIO.context = new webkitAudioContext(),
  SoundIO.oscillator = SoundIO.context.createOscillator();
  SoundIO.gainNode = SoundIO.context.createGain();
  SoundIO.volume = 20; // max 100
  SoundIO.gainNode.gain.value = SoundIO.volume;
  SoundIO.oscillator.type = 0; // 0 - Sine, 1 - Square, 2 - Sawtooth, 3 - Triangle

  SoundIO.updateFreqType = function(freqId) {
    this.oscillator.type = freqId;
  };

  SoundIO.updateFreq = function(freq, freqId) {
    // set type
    if (typeof freqId !== 'undefined')
      this.oscillator.type = freqId;

    // set frequency
    this.oscillator.frequency.value = freq;

    // Connect source to a gain node
    this.oscillator.connect(this.gainNode);

    // connect to output
    this.gainNode.connect(this.context.destination);

    this.changeVolume(parseInt($('#volume').val()), 100);

    // start
    this.oscillator.noteOn && this.oscillator.noteOn(0);

    // update view
    $("#freqDisplay").val(freq + " Hz");
  };


  $("#freqSlider").on("change", function() {
    $("#freqDisplay").val( $("#freqSlider").val() + " Hz");
    SoundIO.updateFreq($("#freqSlider").val());
  });

  $("#btnPlay").click(function() {
    SoundIO.updateFreq($("#freqSlider").val());
  });

  $("#btnPause").click(function() {
    // stop frequency increase (if on)
    $("#btnSlowClimb").text("Slowly Increase Frequency");
    slowClimbIncr = -1;

    // kill sound
    SoundIO.oscillator.disconnect();
  });

  $("#comboWaveType").change(function() {
    var typeId = parseInt($(this).val(), 10);
    SoundIO.updateFreq($("#freqSlider").val(), typeId);
  });

  var slowClimbIncr = 0;
  var t;
  // increase
  $("#btnSlowClimb").click(function() {
    slowClimbIncr = $("#freqSlider").val();

    var increase = function() {
      if (slowClimbIncr === -1 || slowClimbIncr > 22000) {return;}

      if ( slowClimbIncr !== 0 &&
           slowClimbIncr !== ( parseInt($("#freqSlider").val(),10)+1) ) {
        slowClimbIncr = $("#freqSlider").val();
      }

      $("#freqSlider").val(slowClimbIncr);
      SoundIO.updateFreq(slowClimbIncr);
      slowClimbIncr++;

      t = setTimeout(increase, 50);
    };

    $("#freqSlider").val(slowClimbIncr);
    increase();
  });
  // stop
  $("#btnSlowClimbStop").click(function() {
    if (t)
      clearInterval(t);
  });

  // VOLUME

  SoundIO.changeVolume = function (volume, max) {
    var fraction = volume / max;
    // Let's use an x*x curve (x-squared) since simple linear (x) does not
    // sound as good.
    if (SoundIO.gainNode)
      // console.log("Changing volume", fraction * fraction);
      SoundIO.gainNode.gain.value = fraction * fraction;
  };

  $('#volume').change(function(e) {
    var $el = $(this);
    var volume = parseInt($el.val(), 10);

    SoundIO.changeVolume(volume, 100);
  });

});
