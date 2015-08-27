
/////////////////////
////   game const
/////////////////////
var rooms = {}






/////////////////////
////   communication
/////////////////////
require('sandbox-io').on('connection', function(socket) {

    var listener = {
        s: socket
    }
    var player

    console.log('receive connection')

    var emitPlayerList = function( roomName ){
        var listeners = rooms[ roomName ].l

        for( var i = listeners.length; i--;)
            listeners[i].s.emit('players', rooms[ roomName ].p)
    }

    socket.on('viewer', function( data ){


        var r = data.room || 6

        console.log('have a viewer in ['+r+'] ' +socket.id)

        ;(rooms[ r ] = rooms[ r ] || {l:[],p:[]}  ).l.push(listener)

        emitPlayerList( r )
    })

    socket.on('player', function( data ){


        var r = data.room || 6
        var playerName = data.name

        console.log('have a player,'+playerName+' in ['+r+'] ' +socket.id)

        ;(rooms[ r ] = rooms[ r ] || {l:[],p:[]}  ).l.push(listener)

        // re claim the player
        // not necessary a good idea
        for( var i = rooms[ r ].p.length; i--; )
            rooms[ r ].p[ i ].n == playerName && ( player = rooms[ r ].p[ i ] )

        // if the player does not alread exist, push it
        !player && ( player = {x: 5,y: 5,v: {x:0,y:0},n: playerName} ) && rooms[ r ].p.push(player)

        emitPlayerList( r )
    })

    socket.on('move', function( data ){

        player.v.x = +data.slice( 0, 5 )
        player.v.y = +data.slice( 5, 10 )

    })
})

console.log('server ready')











/////////////////////
////   game mecanic
/////////////////////

var updateGame = function( game, delta ){

    var players = game.p


    // update const for each player
    for( var i = players.length ; i-- ; ){

        // update position
        players[i].x += delta * players[i].v.x
        players[i].y += delta * players[i].v.y

        // update cooldown


        // check collision

        // with walls
        // TODO
    }






}


/////////////////////
////   game loop
/////////////////////

// pack a number in exactly 5 char
var compac=function(x){
    x = ''+x
    x.indexOf('.') <0 && (x+='.')
    return ( x+'00000000' ).slice(0,5)
}
var loop = function(  ){
    var delta = 1

    for ( var roomName in rooms ){

        var game = rooms[ roomName ]

        // close the room
        if ( !game.l.length ){
            delete rooms[ roomName]
            continue
        }


        // game loop
        updateGame( game, delta )

        // emit stuff
        var toSend =
            game.p.map(function(p){
                return [p.x,p.y,p.v.x,p.v.y].map(compac).join('')
            }).join('')+'|'

        var listeners=game.l
        for(var i=listeners.length; i--;)
            listeners[ i ].s.emit('tic', toSend)
    }


    setTimeout( loop, 1000 )
}

loop()
