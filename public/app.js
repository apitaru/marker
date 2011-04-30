
$(function () {

    var lineStyleEnums = 
    {
        RED: "lineStyleEnums_red",
        BLACK: "lineStyleEnums_black", 
        ERASER: "lineStyleEnums_eraser"
    };
    
    
    var socket = new io.Socket(null, {port: 8080, rememberTransport: false,  transports:['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart']});
    socket.connect();   

  socket.on('message', function(obj){
      if ('buffer' in obj){
        for (var i in obj.buffer) parseMessage(obj.buffer[i]);
      } else parseMessage(obj);

    });
        
    function parseMessage(obj)
    {
       // alert(obj.message[0] + " " + obj.message[1]);
        if(obj.message != undefined)
        {
            if(obj.message.length > 0)
            {
                var msg = obj.message[1].split("||");
                setLineStyle(msg[0]);
                if(msg.length > 0)
                {
                    var points = msg[1].split(",");
                    for(var i in points) 
                    {
                        points[i] = points[i].split("|");
                    }
        
                    simulateDraw(points)
                }
            };
        };
        
    };
    
    function setLineStyle(lineStyleConst)
    {
        switch(lineStyleConst)
        {
            case lineStyleEnums.RED:
                context.lineWidth = 10.0;
                context.strokeStyle = $("#red").css("background-color");         
                break;
            case lineStyleEnums.BLACK:
                context.lineWidth = 10.0;
                context.strokeStyle = $("#black").css("background-color");
                break;
            case lineStyleEnums.ERASER:
                context.lineWidth = 25.0;
                context.strokeStyle = "#fff";           
                break;
            default:
        }
    }
    
    
    function simulateDraw(points)
    {

        for(var i=0; i< points.length; i++)
        {
             if(i == 0) {
                context.beginPath();
                context.moveTo(points[i][0], points[i][1]);             
            } else if(i>0)
            {
                context.lineTo(points[i][0], points[i][1]);
            };
        };
        context.stroke();
        
    }
 
    function sendSocket(points_ar){
      socket.send(lineStyle + "||" + points_ar);
    };
    
    ///////////
    
  function getMousePosition(event) {
    return { x: event.pageX, y: event.pageY };
  }

  var isDrawing = false,
      canvas = $("#canvas"),
      context;
 
  var pointsBuffer = [];

  canvas.attr("height", $(window).height() - 64);
  canvas.attr("width", $(window).width());

  context = canvas.get(0).getContext("2d");

    var lineStyle = lineStyleEnums.RED;
    setLineStyle(lineStyle);
    
  canvas.bind("mousedown", function (e) {
    var point = getMousePosition(e);
    context.beginPath();
    context.moveTo(point.x, point.y);
    pointsBuffer.push(point.x + "|" + point.y);
    isDrawing = true;
    e.preventDefault();
  });

  canvas.bind("mousemove", function (e) {
    var point;

    if (isDrawing) {
      point = getMousePosition(e);
      context.lineTo(point.x, point.y);
      pointsBuffer.push(point.x + "|" +  point.y);
      context.stroke();
    }
  });

  canvas.bind("mouseup", function (e) {
    isDrawing = false;
    if(pointsBuffer.length > 1)
    {
        sendSocket(pointsBuffer.join());
    }
    pointsBuffer = [];
  });

  canvas.bind("mouseout", function (e) {
    isDrawing = false;
  });

  $("#red").click(function (e) {

    lineStyle = lineStyleEnums.RED;
    setLineStyle(lineStyle);
    e.preventDefault();
  });
  
  $("#black").click(function (e) {
    lineStyle = lineStyleEnums.BLACK;
    setLineStyle(lineStyle);
    e.preventDefault();
  });
  
  $("#eraser").click(function (e) {
    lineStyle = lineStyleEnums.ERASER;
    setLineStyle(lineStyle);
    e.preventDefault();
  });
});

