//Noel Case, 2-21-20
//This contains all data structures for the 
//audio functionality in the Brain Battle game
class sfx {
  constructor(root){
    this.alert = [new p5.MonoSynth(), new p5.MonoSynth(), new p5.MonoSynth(), new p5.MonoSynth()];
    for (var i = 0; i < 4; i++)
      this.alert[i].setADSR(0.001, 0.3, 0.9, 0.08);
    this.root = root;
    this.volMain = 1;
  }
  
  playAlert(nVel, volMain) {
    this.alert[0].play(this.root * (1.06 / 2));
    this.alert[1].play(this.root * (1.06), this.volMain * this.nVel / 3);
    this.alert[2].play(this.root * (2 * 1.06), this.volMain * this.nVel / 6);
    this.alert[3].play(this.root * (4 * 1.06), this.volMain * this.nVel / 8);
  }
  
  setVolume(volMain, nVel){ 
   this.alert[0].amp(this.volMain * this.nVel, 0.01);
   this.alert[1].amp(volMain * this.nVel / 3, 0.01)
   this.alert[2].amp(this.volMain * this.nVel / 6, 0.01);
   this.alert[3].amp(this.volMain * this.nVel / 8, 0.01);
  }
}

class music {
  constructor(root){
    userStartAudio();
    //programming the drone:
    this.volMain = 0.5;
    this.root = root;
    this.drone = [new p5.Oscillator('sine'), new p5.Oscillator('sine'), new p5.Oscillator('sine'), new p5.Oscillator('sine')];
  }
  
  startDrone() {
    this.drone[0].start(0, this.root);
    this.drone[1].start(0, (2 * this.root) - 0.25);
    this.drone[2].start(0, (3 * this.root) + 0.125);
    this.drone[3].start(0, (5 * this.root) - 0.125); 
    for(var k=0; k<4; k++) 
      this.drone[k].amp(0); 
  }
  
  stop() {
    for(var k=0; k<4; ++k)
      this.drone[k].stop();
  }
  
   setVolume(volMain) {
     this.drone[0].amp(this.volMain * 0.125, 0.2);
     this.drone[1].amp(this.volMain * 0.08, 0.2);
     this.drone[2].amp(this.volMain * 0.06, 0.2);
     this.drone[3].amp(this.volMain * 0.075, 0.2);
   }
  
   updateDetune(health, healthInit){
     if (this.health <= healthInit) {
     this.drone[1].freq(2 * this.root + 10 * (1 - exp(-(1 / 50) * (this.healthInit - this.health) / 0.4)) + 0.125);
     this.drone[2].freq(3*this.root + 4*(1-exp(-(1/50)*(this.healthInit - this.health)/0.4)) - 0.125);
   }
 }
}
