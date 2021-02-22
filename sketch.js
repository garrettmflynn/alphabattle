
  let connectToggle;
  let disconnectToggle;
  let museToggle;
  let marg = 100;
  let key;
  let health = 100;
  let width = 200;
  let ellipseRad = width/8

  setup = () => {

      // P5 Setup
      var c = createCanvas(windowWidth, windowHeight);
      c.parent('p5Div');
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


      // Brains@Play Setup
      museToggle.mousePressed(async () => {
          await game.bluetooth.devices['muse'].connect()
          game.connectBluetoothDevice()
          connectToggle.show()
      });

      connectToggle.mousePressed(() => {
          game.connect({'guestaccess': true})
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
        beginGameToggle.hide()
        game.brains[game.info.access].get(game.me.username).data.ready = true;
      })
    }
    
    draw = () => {

      clear()

      if (game.bluetooth.connected && ['flex','block'].includes(museToggle.style('display'))){
          museToggle.hide()
      }
    
      // Update Voltage Buffers and Derived Variables
      game.update();

      // Get Opponent (if exists)
      let me = game.brains[game.info.access].get(game.me.username)
      let opponent;
      if(me !== undefined){
        opponent = game.brains[game.info.access].get(me.data.opponent)
      }

      // Try to Assign Opponents (if connected to server)
      if (game.connection.status){
      if (me !== undefined){
        if (me.data.ready){
      if (me.data.opponent === undefined ){
          let opp = assignOpponent(game)
          if (opp !== undefined){
            me.setData({health: 100, opponent: opp})
          }
      } 

      // Reset If Opponent Leaves
      else {
      if (opponent === undefined){
        me.data = {opponent:undefined,health: undefined,ready:false}
        beginGameToggle.show()
      }  
      // TERMINATE GAME
      // else if (opponent.data.terminate){
      //   me.data = {username:undefined,health: undefined,ready:false}
      //   opponent.data = {username:undefined,health: undefined,ready:false}
      //   beginGameToggle.show()
      // }
      // Calculate Battle Outcomes
      else {
      let attack = me.getMetric('beta')
      let defense = me.getMetric('alpha')
      // let val = attack.average
      let val = attack
      me.setData({attack:val})

      let diff = defense - opponent.data.attack
      if (!isNaN(diff)){
        me.data.health += diff
      }
    }
    }
  }
  }
}

    let termFlag = false;
    // Create Me and Opponent Markers
    [me,opponent].forEach( async (user,ind) => {

      if (user !== undefined){

      // Active Indicator
      if (user.data.health === undefined){
        fill(255,50,0)
      } else if (user.data.health >= 0 || !user.data.ready){
        fill(0,255,50)
      } else {
        fill(255,50,0)
        termFlag = true;
      }

      let centerY = windowHeight/2 - (marg/2)
      let centerX = (windowWidth/2) + (marg)*((2*ind-1))

      // ellipse(centerX-(2*ind-1)*ellipseRad/2, centerY-ellipseRad/2, ellipseRad)
      // fill(100,100,100)
      // ellipse(centerX, centerY, 2*ellipseRad)

      let barScale = ((windowWidth/2) - 2*marg)/100

      // User Text
      fill('white')
      textSize(15)
      textAlign(CENTER);
      let health;
      if (user.data.health === undefined){
        health = ''
        fill(100)
        rect(centerX-(2*ind-1)*ellipseRad/2,centerY-ellipseRad/2,(2*ind-1)*100*barScale,10)
      } else {
        fill(255,50,0)
        health = user.data.health.toFixed(1)
        rect(centerX-(2*ind-1)*ellipseRad/2,centerY-ellipseRad/2,(2*ind-1)*health*barScale,10)
      }
      // text(health, centerX, centerY)
    }
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
        text('me', (windowWidth/2) + (marg)*(-1), windowHeight/2)
      }
      if (opponent !== undefined && opponent.data.ready){
        textAlign(LEFT);
        textSize(15)
        text(opponent.username, (windowWidth/2) + (marg)*(+1), windowHeight/2)
      }

      // fill('white')
      // text(me.username + ' vs ' + opponent.username, windowWidth/2, windowHeight/2)
    }

    if (termFlag){
      // TERMINATE GAME
      // me.data = {}
      // beginGameToggle.show()
    }
  }

    
    windowResized = () => {
      resizeCanvas(windowWidth, windowHeight);
      connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-50-connectToggle.height);
      disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-50-disconnectToggle.height);
      museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
      beginGameToggle.position((windowWidth/2)-beginGameToggle.width/2, (3*windowHeight/4)-beginGameToggle.height);
    }

    keyPressed = () => {
      if (keyCode === RETURN) {

        // TERMINATE GAME

        // let me = game.brains[game.info.access].get(game.me.username)
        // let opponent = game.brains[game.info.access].get(me.data.opponent)
        // me.setData({terminate: true})
        // opponent.setData({terminate: true})
      } 
    }

    function assignOpponent(game) {
      let opp;
      let usernames = game.getUsernames()
      let equalTo = [game.me.username,undefined]
      if (usernames.length > 1){
        loop1:
        for (condition of equalTo){
        loop2:
        for (let username of usernames) {
          if (username !== game.me.username){
            let data = game.brains[game.info.access].get(username).data
            if (data.opponent === condition && data.ready){
              opp = username
              break loop1
            }
        }
        }
      }
      }
      return opp
    }