
  let connectToggle;
  let disconnectToggle;
  let museToggle;
  let margin = 100;
  let input 
  let hasUserId = false;

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

      // Brains@Play Setup
      // museToggle.mousePressed(async () => {
      //     await game.bluetooth.devices['muse'].connect()
      //     game.connectBluetoothDevice()
      //     connectToggle.show()
      // });

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
          game.disconnect()
          disconnectToggle.hide()
          connectToggle.show()
          museToggle.show()
          beginGameToggle.hide()
      })

      beginGameToggle.mousePressed(() => {
        me = game.brains[game.info.access].get(game.me.username)
        if (me.data.opponent !== undefined){
          game.brains[game.info.access].get(me.data.opponent).data = {}
        }
        me.data = {};
        me.data.ready = true;
        beginGameToggle.hide()
        console.log(me.data)
      })


      // game.connect({'guestaccess': true})
      // connectToggle.hide()
      // disconnectToggle.hide()
      museToggle.hide()
      connectToggle.show()

      // beginGameToggle.show()
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
        me.data = initializeData()
        beginGameToggle.show()
      }  
      // Reset if Opponent Dies
      else if (opponent.data.health === 0){
        console.log('opponent flatlined')
        opponent.data = initializeData()
        console.log(me.data)
        me.data = initializeData()
        console.log(me.data)
        beginGameToggle.show()
      } else if (me.data.health === 0){
        // Reset if You Died
        opponent.data = initializeData()
        console.log(me.data)
        me.data = initializeData()
        console.log(me.data)
        console.log('you flatlined. resetting...')
        beginGameToggle.show()
      }
      // Keep On Battling!
      else if (me.data.health !== undefined) {
        console.log('battling')
      // let attack = me.getMetric('beta')
      // let defense = me.getMetric('alpha')
      // let val = attack.average
      let attack = Math.random()*20
      let defense =  Math.random()*20
      let val = attack
      me.data.attack = val

      let diff = defense - opponent.data.attack
      if (!isNaN(diff)){
        if (me.data.health + diff >= 0 && me.data.health + diff <= 100){
          // Only let health go down
          if (diff < 0){
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

    // Create Me and Opponent Markers
    [me,opponent].forEach( async (user,ind) => {

      let centerY = windowHeight/2 - (margin/2)
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
      if (user.data.health === undefined){
      } else {
        health = user.data.health
        let colorScaling = ((100-health)/100)
        currentColor = color(100 + 155*(colorScaling),100+ 155*(1-colorScaling),100+ 155*(1-colorScaling))
        currentColor.setAlpha(155)
        noStroke()
        fill(currentColor)
        rect(centerX,centerY,(2*ind-1)*health*barScale,10)
      }
    }
    noFill()
    stroke('white')
    rect(centerX,centerY,(2*ind-1)*100*barScale,10)
    })

    if (me !== undefined || opponent !== undefined){
      fill('white')
      textStyle(BOLD)
      textAlign(CENTER);
      textSize(50)
      text('vs', windowWidth/2, windowHeight/2)
      if (me !== undefined){
        textAlign(RIGHT);
        textSize(15)
        if (hasUserId){
        text(me.username, (windowWidth/2) + (margin)*(-1), windowHeight/2)
        } else {
          text('me', (windowWidth/2) + (margin)*(-1), windowHeight/2)
        }
      }
      if (opponent !== undefined && opponent.data && opponent.data.ready){
        textAlign(LEFT);
        textSize(15)
        text(opponent.username, (windowWidth/2) + (margin)*(+1), windowHeight/2)
      }
    }
  }
    
    windowResized = () => {
      resizeCanvas(windowWidth, windowHeight);
      connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-50-connectToggle.height);
      disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-50-disconnectToggle.height);
      museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
      beginGameToggle.position((windowWidth/2)-beginGameToggle.width/2, (3*windowHeight/4)-beginGameToggle.height);
      input.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height);
      greeting.position(windowWidth-input.width-50, windowHeight-50-2.5*disconnectToggle.height-40);
    }

    mouseClicked = () => {
      console.log('mouse pressed')
    }

    keyPressed = () => {
      if (keyCode === RETURN) {
        me = game.brains[game.info.access].get(game.me.username)
        me.setData({health: -1000})
      } 
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