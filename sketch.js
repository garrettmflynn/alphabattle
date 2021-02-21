
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
      connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-125-connectToggle.height);
      disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-125-disconnectToggle.height);
      museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
      beginGameToggle.position((windowWidth/2)-museToggle.width, (windowHeight/2)-museToggle.height);
      disconnectToggle.hide()
      beginGameToggle.hide()


      // Brains@Play Setup
      museToggle.mousePressed(async () => {
          await game.bluetooth.devices['muse'].connect()
          game.connectBluetoothDevice()
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

      let me = game.brains[game.info.access].get(game.me.username)
      if (game.connection.status){
      if (me !== undefined){
        if (me.data.ready){
      if (me.data.opponent === undefined ){
          let opp = assignOpponent(game)
          me.setData({health: 100, opponent: opp})
      } else {
      let opponent = game.brains[game.info.access].get(me.data.opponent)
      if (opponent === undefined){
        me.data.opponent = undefined;
      } else {
      let attack = Math.random() // me.getMetric('beta')
      let defense = Math.random() // me.getMetric('alpha')
      // let val = attack.average
      let val = attack
      me.setData({attack:val})

      console.log()

      let diff = defense - opponent.data.attack
      if (!isNaN(diff)){
        me.data.health += diff
      }
    }
    }
  }
  }
}

    let userInd = 0
    game.brains[game.info.access].forEach( async (user,username) => {
      // Active Indicator
      if (user.data.health === undefined || user.data.health >= 0){
        fill(0,255,50)
      } else {
        fill(255,50,0)
        me.data.opponent = undefined;
        me.data.health = undefined;
        me.data.ready = false;
        beginGameToggle.show()
      }

      ellipse(marg-ellipseRad/2, marg + (2.5*ellipseRad)*userInd-ellipseRad/2, ellipseRad)
      
      fill(100,100,100)
      ellipse(marg, marg + (2.5*ellipseRad)*userInd, 2*ellipseRad)

      // User Text
      fill('white')
      textAlign(LEFT);
      text(username + ' vs ' + user.data.opponent, marg + ellipseRad + 10, marg + (2.5*ellipseRad)*userInd)
      textAlign(CENTER);
      let health;
      if (user.data.health === undefined){
        health = 'None'
      } else {
        health = user.data.health.toFixed(1)
      }
      text(health, marg, marg + (2.5*ellipseRad)*userInd)
      userInd++
    })

  }

    
    windowResized = () => {
      resizeCanvas(windowWidth, windowHeight);
      connectToggle.position(windowWidth-25-connectToggle.width, windowHeight-125-connectToggle.height);
      disconnectToggle.position(windowWidth-25-disconnectToggle.width, windowHeight-125-disconnectToggle.height);
      museToggle.position(windowWidth-25-museToggle.width, windowHeight-50-museToggle.height);
      beginGameToggle.position((windowWidth/2)-museToggle.width, (windowHeight/2)-museToggle.height);
    }

    keyPressed = () => {
      if (keyCode === RETURN) {
        game.brains[game.info.access].get(game.me.username).setData({active: false})
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