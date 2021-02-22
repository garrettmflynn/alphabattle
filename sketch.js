  let connectToggle;
  let disconnectToggle;
  let museToggle;
  let beginGameToggle;
  let input;
  let greeting;
  let message;
  let title;

  let margin = 100;
  let hasUserId = false;
  let easing = 0.1;
  let barHeight = 50;
  let root = 52.125;
  let nVel = 0.8;
  let volMain = 0.8;
  let dTime = 20;
  let snd = new music(root, volMain);
  //let effects = new sfx(root,nVel);

  setup = () => {

      // P5 Setup
      createCanvas(windowWidth, windowHeight);
      textAlign(CENTER, CENTER);
      connectToggle = createButton('Connect to Server');
      beginGameToggle = createButton('Begin Game');
      museToggle = createButton('Connect Muse');
      disconnectToggle = createButton('Disconnect');
      connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-50-connectToggle.height);
      disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-50-disconnectToggle.height);
      museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
      beginGameToggle.position((windowWidth/2)-beginGameToggle.width/2, (3*windowHeight/4)-beginGameToggle.height);
      disconnectToggle.hide()
      connectToggle.hide()
      beginGameToggle.hide()

      // Name
      input = createInput();
      input.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height);
      input.show()

      greeting = createElement('p', 'What is your name?');
      greeting.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height-40);

      message = createElement('div')
      message.html(`<h1>You Won!</h1>
      <p>Great Job</p>`)
      message.center();
      message.hide()

      title = createElement('div')
      title.html(`<h1>AlphaBattle</h1>
      <p>Fight to the Death with your Brains 🤯</p>`)
      title.center();
      title.hide()

      museToggle.mousePressed(async () =>  {
          //Audio
          snd.startDrone();
          snd.setVolume(volMain);
          // BLE
          await game.bluetooth.devices['muse'].connect()
          game.connectBluetoothDevice()
          connectToggle.show()
      });

      connectToggle.mousePressed(() => {
        if (input.value() !== ''){
          game.connect({'guestaccess': true, 'guestId': input.value()})
          hasUserId = true;
        } else { 
          game.connect({'guestaccess': true})
        }
          disconnectToggle.show()
          connectToggle.hide()
          museToggle.hide()
          beginGameToggle.show()
      });
    
      disconnectToggle.mousePressed(() => {
          disconnect()
      })

      beginGameToggle.mousePressed(() => {
        me = game.brains[game.info.access].get(game.me.username)
        if (me.data.opponent !== undefined){
          game.brains[game.info.access].get(me.data.opponent).data = {}
        }
        me.data = {};
        me.data.ready = true;
        beginGameToggle.hide()
      })

      // museToggle.hide()
      // connectToggle.show()
    }
    
    draw = () => {

      background(0)

      if (game.bluetooth.connected && ['flex','block'].includes(museToggle.style('display'))){
          museToggle.hide()
      }
    
      // Update Voltage Buffers and Derived Variables
      game.update();

      // Get Opponent (if exists)
      me = game.brains[game.info.access].get(game.me.username)

      if(me !== undefined){
        opponent = game.brains[game.info.access].get(me.data.opponent)
      }

      // Try to Assign Opponents (if connected to server)
      if (game.connection.status){
      if (me !== undefined){
        if (me.data.ready){

      // Assign Opponent If Ready For One
      if (me.data.opponent === undefined ){
          let opp = getOpponent(game,me)
          if (opp !== undefined){
            console.log('setting up my health')
            me.setData({health: 100, opponent: opp})
          }
      } 

      // Reset If Opponent Leaves
      else {
        // console.log(me.data)

      if (opponent === undefined){
        console.log('opponent left server')
        disconnect()
        // me.data = initializeData()
        // beginGameToggle.show()
      }  
      // Reset if Opponent Dies
      else if (opponent.data.health === 0){
        console.log('opponent flatlined')
        disconnect()
        // opponent.data = initializeData()
        // me.data = initializeData()
        // beginGameToggle.show()
      } 
      // Reset if You Died
      else if (me.data.health === 0){
        console.log('you flatlined. resetting...')
        disconnect()
        // opponent.data = initializeData()
        // me.data = initializeData()
        // beginGameToggle.show()
      }
      // Keep On Battling!
      else if (me.data.health !== undefined) {
        let val;
        let attack;
        let defense;
      if (game.bluetooth.status){
        attack = me.getMetric('beta')
        defense = me.getMetric('alpha')
        val = attack.average
      } else {
        attack = noise(Date.now()/1000)*10
        defense =  noise(Date.now()/1000 + 1000)*10
        val = attack
      }
      me.data.attack = val
      let diff = defense - opponent.data.attack
      if (!isNaN(diff)){
        if (me.data.health + diff >= 0 && me.data.health + diff <= 100){
          // Only let health go down
          if (diff < 0){
            console.log(diff)
            me.data.health += diff
          }
        } else if (me.data.health + diff < 0){
          me.data.health = 0;
        } else {
          me.data.health = 100;
        }
      }
    }
    // console.log(me.data)
    }
  }
  }
}

    let centerY = windowHeight/2;

    // Create Me and Opponent Markers
    [me,opponent].forEach( async (user,ind) => {
      let centerX = (windowWidth/2) + (margin)*((2*ind-1))
      let barScale = ((windowWidth/2) - 2*margin)/100

      if (user !== undefined){

      // Active Indicator
      // if (user.data.health === undefined){
      //   fill(255,50,0)
      // } else if (user.data.health >= 0 || !user.data.ready){
      //   fill(0,255,50)
      // } else {
      //   fill(255,50,0)
      //   termFlag = true;
      // }
      // User Text
      fill('white')
      textSize(15)
      textAlign(CENTER);
      let currentColor;
      let health;
      if (user.data.health !== undefined){
        health = user.data.health
        if (user.easedHealth === undefined){
          user.easedHealth = health
        }
        user.easedHealth += (health - user.easedHealth)*easing
        let colorScaling = ((100-user.easedHealth)/100)
        currentColor = color(100 + 155*(colorScaling),100+ 155*(1-colorScaling),100+ 155*(1-colorScaling))
        currentColor.setAlpha(155)
        noStroke()
        fill(currentColor)
        rect(centerX,centerY - barHeight,(2*ind-1)*user.easedHealth*barScale,barHeight)
      }
    }
    noFill()
    stroke('white')
    rect(centerX,centerY - barHeight,(2*ind-1)*100*barScale,barHeight)
    })

    if (me !== undefined || opponent !== undefined){
      fill('white')
      textStyle(NORMAL)
      textAlign(CENTER,CENTER);
      textSize(20)
      text('vs', windowWidth/2, centerY - barHeight/2)
      if (me !== undefined){
        textAlign(RIGHT);
        textSize(15)
        if (hasUserId){
          text(me.username, (windowWidth/2) + (margin)*(-1), windowHeight/2  + (margin/4))
        } else {
          text('me', (windowWidth/2) + (margin)*(-1), windowHeight/2  + (margin/4))
        }
      }
      if (opponent !== undefined && opponent.data && opponent.data.ready){
        textAlign(LEFT);
        textSize(15)
        if (opponent.username.match(/\w\w\w\w\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w-\w\w\w\w\w\w\w\w\w\w\w\w/)){
        text('guest', (windowWidth/2) + (margin)*(+1), windowHeight/2)
        } else {
          text(opponent.username, (windowWidth/2) + (margin)*(+1), windowHeight/2)
        }
      }
    }
  }
    
  windowResized = () => {
    resizeCanvas(windowWidth,windowHeight)
    connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-50-connectToggle.height);
    disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-50-disconnectToggle.height);
    museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
    beginGameToggle.position((windowWidth/2)-beginGameToggle.width/2, (3*windowHeight/4)-beginGameToggle.height);
    input.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height);
    greeting.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height-40);
    message.center();
  }

    mouseClicked = () => {
    }

    keyPressed = () => {
    }

    function getOpponent(game,me) {
      let opp;
      let usernames = game.getUsernames()
      let equalTo = [me.username,undefined]
      if (usernames.length > 1){
        loop1:
        for (condition of equalTo){
        loop2:
        for (let username of usernames) {
          if (username !== me.username){
            let data = game.brains[game.info.access].get(username).data
            if (data.opponent === condition && data.ready){
              opp = username
              console.log('new opponent: ',opp)
              break loop1
            }
        }
        }
      }
      }
      return opp
    }

    function initializeData() {
      return {
        ready: false,
        opponent: undefined,
        attack: undefined,
        health: undefined,
      }
    }

    function disconnect(){
      game.disconnect()
      disconnectToggle.hide()
      connectToggle.show()
      // museToggle.show()
      beginGameToggle.hide()
      game.brains[game.info.access].get(game.me.username).data = {};
    }
