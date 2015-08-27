
/////////////////////
////   geom function
/////////////////////
var diff = function( a, b) {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
        z: b.z - a.z,
    }
}
var scal = function( a, b) {
    return a.x * b.x +  a.y * b.y + a.z * b.z
}
var normalise = function( a ) {
    var n = Math.sqrt( scal(a,a) )
    a.x/=n
    a.y/=n
    a.z/=n
}
var prod = function( a, b ) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    }
}


/////////////////////
////   game const
/////////////////////

//
// [
//   {
//      n :   // name
//      x :
//      y :
//   }
// ]
var players = []
var projectiles = []
var Tile = 1

/////////////////////
//// world renderer
/////////////////////

var worldCanvas = document.createElement('canvas')
var canvasWidth = worldCanvas.width = window.innerWidth
var canvasHeight = worldCanvas.height = window.innerHeight
document.body.appendChild( worldCanvas )
var worldCtx = worldCanvas.getContext('2d')

var cameraOrigin = {
    x: -100,
    y: -100,
    z:  10
}
var U
var V
var Z={x:0,y:0,z:0}
var updateCamera = function(){

    Z.x = cameraOrigin.x
    Z.y = cameraOrigin.y
    Z.z = cameraOrigin.z
    normalise( Z )

    U = prod( {x:0,y:0,z:1}, Z )
    scal( U,U ) < 0.001 && ( U.z = 1 )

    normalise( U )

    V = prod( Z, U )

    normalise( V )
}
var zoom = 0.3
// var toEye={x:0,y:0,z:0}
// var proj = function( p, target ){
//
//     toEye.x = p.x - cameraOrigin.x
//     toEye.y = p.y - cameraOrigin.y
//     toEye.z = p.z - cameraOrigin.z
//
//     target.x = scal( U, toEye ) * zoom +0.5
//     target.y = scal( V, toEye ) * zoom +0.5
// }
// var proj_ = function( x,y,z, target ){
//
//     x -= cameraOrigin.x
//     y -= cameraOrigin.y
//     z -= cameraOrigin.z
//
//     target.x = ( U.x*x + U.y*y + U.z*z ) * zoom +0.5
//     target.y = ( V.x*x + V.y*y + V.z*z ) * zoom +0.5
// }
// var projN = function( p ){
//     var o={x:0,y:0,z:0}
//     proj( p, o )
//     return o
// }
var point = function( x,y,z, k ){
    var h = ( Z.x*(x-cameraOrigin.x) + Z.y*(y-cameraOrigin.y) + Z.z*(z-cameraOrigin.z) )

    h = -h/200

    worldCtx[ k ]( (( U.x*x + U.y*y + U.z*z ) * h * zoom +0.5 )* canvasWidth, (( V.x*x + V.y*y + V.z*z ) * h * zoom +0.5 )* canvasHeight  )
}

// entity in z buffer must declare
// {
//     q   : tile|player|bullet  ( type )
//     x   : number
//     y   : number
//     z   : number              ( x,y,z are coordonate)
//     t   : number              ( cached distance to the camera )
//     d   : boolean             ( is dead, when set to true, will be garbage collected )
//     c   : boolean             ( position has changed )
// }
var zbuffer = []
var render = function(){

    //////////
    ////////// update zbuffer


    // add every new thing
    // TODO

    // update every entity and trash the one that are no longueur in the scene
    for( var i = zbuffer.length; i--;){

        var entity = zbuffer[ i ]

        // garbage collector
        if ( entity.d && zbuffer.splice( i, 1 ) )
            continue

        // recompute t
        var v = diff( entity, cameraOrigin )
        entity.t = scal( v, v )   // it s t square actually,  square is monotone so whatever
    }

    // sort
    zbuffer = zbuffer.sort( function(a,b){
        return a.t< b.t ? 1 : -1
    })





    //////////
    ////////// draw entities

    // clear
    worldCtx.clearRect(0,0,canvasWidth,canvasHeight)



    // draw
    for( i = zbuffer.length; i--;){

        entity = zbuffer[ i ]

        switch( entity.q ) {
            case Tile :


                // var l = ( entity.t - zbuffer[ 0 ].t )/( zbuffer[ zbuffer.length-1 ].t - zbuffer[ 0 ].t )
                // var hex = (   (0| Math.max(l*255, 20) ) * ( 256*256 + 256 + 1 )    ).toString( 16 )

                worldCtx.fillStyle = entity.color
                // worldCtx.strokeStyle = '#'+hex
                // worldCtx.strokeStyle = entity.color
                // worldCtx.fillStyle = '#'+hex
                worldCtx.lineWidth = 3




                var x = entity.x+ ( (( Z.x<0 )<<1 )-1 ) * 0.5
                worldCtx.beginPath()
                point( x, entity.y + 0.5, entity.z , 'moveTo' )
                point( x, entity.y + 0.5, entity.z +50 , 'lineTo' )
                point( x, entity.y - 0.5, entity.z +50 , 'lineTo' )
                point( x, entity.y - 0.5, entity.z , 'lineTo' )
                worldCtx.fill()


                var y = entity.y+ ( (( Z.y<0 )<<1 )-1 ) * 0.5
                worldCtx.beginPath()
                point( entity.x + 0.5, y, entity.z, 'moveTo' )
                point( entity.x + 0.5, y, entity.z+ 50, 'lineTo' )
                point( entity.x - 0.5, y, entity.z+ 50, 'lineTo' )
                point( entity.x - 0.5, y, entity.z, 'lineTo' )
                worldCtx.fill()



                worldCtx.beginPath()
                point( entity.x + 0.5, entity.y + 0.5, entity.z, 'moveTo' )
                point( entity.x - 0.5, entity.y + 0.5, entity.z, 'lineTo' )
                point( entity.x - 0.5, entity.y - 0.5, entity.z, 'lineTo' )
                point( entity.x + 0.5, entity.y - 0.5, entity.z, 'lineTo' )
                worldCtx.fill()




                // worldCtx.fillStyle = entity.color
                // worldCtx.lineStyle = '#'+hex
                // // worldCtx.fillStyle = '#'+hex
                // worldCtx.lineWidth = 1.8
                //
                // for( var k=ps.length; k--;) {
                //     worldCtx.beginPath()
                //     worldCtx.moveTo( ps[k][0].x * canvasWidth, ps[k][0].y * canvasHeight )
                //     for( var j=1;j<4;j++)
                //         worldCtx.lineTo( ps[k][j].x * canvasWidth, ps[k][j].y * canvasHeight )
                //     // worldCtx.fill()
                //     worldCtx.stroke()
                // }

        }
    }



    requestAnimationFrame( render )
}





/////////////////////
////   parse option URL
/////////////////////

var params ={}
location.search
        .replace('?', '')
        .split( '&' )
        .forEach(function(banana){
            banana = banana.split('=')
            params[banana[0]] = banana[1]
        })









/////////////////////
////   com
/////////////////////

var socket = io( document.location.href )

    .on( 'connect' , function( ){


        // declare new player
        // if this instance is a playable
        if ( params.name )
            socket.emit('player', params)
        else
            socket.emit('viewer', params)


        params.name && setTimeout( function(){  socket.emit('move', '0.10000000')  }, 5000 )
    })

    .on( 'tic' , function( data ){

        var pos = data.split('|')

        var s = pos[ 0 ]

        for( var i = players.length; i--; ){

            players[ i ].x = +s.slice( i*20, i*20+5 )
            players[ i ].y = +s.slice( i*20+5, i*20+10 )
            players[ i ].v.x = +s.slice( i*20+10, i*20+15 )
            players[ i ].v.y = +s.slice( i*20+15, i*20+20 )

        }

        // render()
    })
    .on( 'players' , function( data ){

        players=data

    })


/////////////////////
////   bootstrap
/////////////////////

for( var x=10;x--;)
for( var y=10;y--;)
    zbuffer.push({
        x: x-5,
        y: y-5,
        z: Math.random() * 4,
        q: Tile,
        color: '#'+( 0| ( 255*255*100+ (255*255*150 * Math.random() ) ) ).toString( 16 )
    })


updateCamera()
render()




/////////////////////
////   controls
/////////////////////
if ( params.freeCamera )
    document.addEventListener('mousemove', function( event ){

        var x = event.pageX / window.innerWidth
        var y = event.pageY / window.innerHeight

        cameraOrigin.x = Math.sin( 1+y ) * Math.cos( x * 8 ) * 50
        cameraOrigin.y = Math.sin( 1+y ) * Math.sin( x * 8 ) * 50
        cameraOrigin.z = Math.cos( 1+y ) * 50

        updateCamera()
        // render()
    })
