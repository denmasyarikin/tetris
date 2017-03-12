
<!--
function silentError(){return true}
window.onerror=silentError;

if (self.location!=top.location) top.location=''+self.location;

// BROWSER DETECTION

ie4 = (navigator.appName.indexOf("Microsoft")>=0 && parseInt(navigator.appVersion)>3) ? true:false;
ns4 = ((navigator.appName=="Netscape" || navigator.appName=="Opera") && parseInt(navigator.appVersion)>3) ? true:false;


// PARAMETERS

nSquares=4;
nTypes=7;
boardHeight=20;
boardWidth =10;
Level=1;
speed0=1000;
speedK=80;
speed=speed0-speedK*Level;
nLines=0;

// GLOBAL VARIABLES

curX=1; curY=1;
skyline=boardHeight-1;
serialN=0;

boardLoaded=0;
gamePaused=0;
gameStarted=0;
sayingBye=0;
timerID=null;

// IMAGES

if (document.images) {
 ImgWhite=new Image(); ImgWhite.src='images/bg-transparent.png';
 Img0=new Image(); Img0.src='images/basic/bg-0.png';
 Img1=new Image(); Img1.src='images/basic/bg-1.png';
 Img2=new Image(); Img2.src='images/basic/bg-1.png';
 Img3=new Image(); Img3.src='images/basic/bg-1.png';
 Img4=new Image(); Img4.src='images/basic/bg-1.png';
 Img5=new Image(); Img5.src='images/basic/bg-1.png';
 Img6=new Image(); Img6.src='images/basic/bg-1.png';
 Img7=new Image(); Img7.src='images/basic/bg-1.png';
}


// ARRAYS

f=new Array();
for (i=0;i<20;i++) {
 f[i]=new Array();
 for (j=0;j<20;j++) {
  f[i][j]=0;
 }
}

xToErase =new Array(0,0,0,0);     yToErase =new Array(0,0,0,0);
dx2      =new Array(0,0,0,0);     dy2      =new Array(0,0,0,0);
dx       =new Array(0,0,0,0);     dy       =new Array(0,0,0,0);
dx_      =new Array(0,0,0,0);     dy_      =new Array(0,0,0,0);
dxBank   =new Array();            dyBank   =new Array();
dxBank[1]=new Array(0, 1,-1, 0);  dyBank[1]=new Array(0, 0, 0, 1);
dxBank[2]=new Array(0, 1,-1,-1);  dyBank[2]=new Array(0, 0, 0, 1);
dxBank[3]=new Array(0, 1,-1, 1);  dyBank[3]=new Array(0, 0, 0, 1);
dxBank[4]=new Array(0,-1, 1, 0);  dyBank[4]=new Array(0, 0, 1, 1);
dxBank[5]=new Array(0, 1,-1, 0);  dyBank[5]=new Array(0, 0, 1, 1);
dxBank[6]=new Array(0, 1,-1,-2);  dyBank[6]=new Array(0, 0, 0, 0);
dxBank[7]=new Array(0, 1, 1, 0);  dyBank[7]=new Array(0, 0, 1, 1);


// FUNCTIONS

function resetGame() {
 for (var i=0;i<boardHeight;i++) {
  for (var j=0;j<boardWidth;j++) {
   f[i][j]=0;
   if (boardLoaded) eval('self.document.s'+i+'_'+j+'.src="'+Img0.src+'"');
  }
 }
 gameStarted=0;
 gamePaused=0;
 nLines=0;
 $('.side #line p').text(nLines);
 $('.side #score p').text(0);
 $('.side #level p').text(1);
 serialN=0;
 skyline=boardHeight-1;
 setNextPiece();
 splashScreen();
}

function splashScreen() {
  fillScreen(function(){
    clearScreen();
  });
}

function fillScreen(callback) {
    var i = 0;
    var interval = setInterval(function(){
        for (var j=0; j<boardWidth; j++) {
           if (boardLoaded) eval('self.document.s'+i+'_'+j+'.src="'+Img1.src+'"');

           if (i == (boardHeight-1) && j == (boardWidth-1)) {
                clearInterval(interval);
                if (typeof callback === 'function') callback();
            }
        }

        i++;
    }, 50);
}

function clearScreen() {
    var i = boardHeight-1;
    var interval = setInterval(function(){
        for (var j=0; j<boardWidth; j++) {
           if (boardLoaded) eval('self.document.s'+i+'_'+j+'.src="'+Img0.src+'"');

           if (i == (boardHeight) && j == (boardWidth)) {
                clearInterval(interval);
            }
        }

        i--;
    }, 50);
}

function reset() {
  clearTimeout(timerID);
  resetGame();
}

function start() {
 if (sayingBye) { top.f0.history.back(); sayingBye=0; }
 top.focus();
 if (gameStarted) {
  if (!boardLoaded) return;
  if (gamePaused) resume();
  return;
 }
 getPiece();
 drawPiece();
 $('.side #line p').text(nLines);
 $('.side #score p').text(0);
 $('.side #level p').text(1);
 gameStarted=1;
 gamePaused=0;
 timerID=setTimeout("play()",speed);
}

function pause() {
 if (boardLoaded && gameStarted) {
  if (gamePaused) {resume(); return;}
  clearTimeout(timerID)
  gamePaused=1;
  top.focus();
 }
}

function resume() {
 if (boardLoaded && gameStarted && gamePaused) {
  play();
  gamePaused=0;
  top.focus();
 }
}

function play() {
 if (movedown()) { timerID=setTimeout("play()",speed); return; }
 else {
  fillMatrix();
  removeLines();
  if (skyline>0 && getPiece()) { timerID=setTimeout("play()",speed); return; }
  else {
   activeL_=0;  activeU_=0;
   activeR_=0;  activeD_=0;
   if (confirm('Game over!\n\nPlay again?')) { init(); } 
   else {
    if (self.sayGoodBye) { init(); sayGoodBye(); }
    else self.close();
   }
  }
 }
}

function fillMatrix() {
 for (var k=0;k<nSquares;k++) {
  X=curX+dx[k];
  Y=curY+dy[k];
  if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
   f[Y][X]=curPiece;
   if (Y<skyline) skyline=Y;
  }
 }
 top.focus();
}

function removeLines() {
 for (var i=0;i<boardHeight;i++) {
  gapFound=0;
  for (var j=0;j<boardWidth;j++) {
   if (f[i][j]==0) {gapFound=1;break;}
  }
  if (gapFound) continue;
  for (var k=i;k>=skyline;k--) {
   for (var j=0;j<boardWidth;j++) {
    f[k][j]=f[k-1][j];
    eval('self.document.s'+k+'_'+j+'.src=Img'+f[k][j]+'.src');
   }
  }
  for (var j=0;j<boardWidth;j++) {
   f[0][j]=0;
   eval('self.document.s'+0+'_'+j+'.src=Img0.src');
  }
  nLines++;
  skyline++;
  setScore(nLines);
 }
}

function setScore(nLines){
  // self.document.form1.Lines.value=nLines;
  $('.side #line p').text(nLines);
  $('.side #score p').text(nLines*250);
  if (nLines%5==0) {Level++; if(Level>10) Level=10;}
  speed=speed0-speedK*Level;
  $('.side #level p').text(Level);
}

function getLevel() {
    Level=1;
 // Level=parseInt(self.document.form1.s1.options[self.document.form1.s1.selectedIndex].value);
 speed=speed0-speedK*Level;
 top.focus();
}

function drawPiece() {
 if (document.images && boardLoaded) {
  for (var k=0;k<nSquares;k++) {
   X=curX+dx[k];
   Y=curY+dy[k];
   if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth && f[Y][X]!=-curPiece) {
    eval('self.document.s'+Y+'_'+X+'.src=Img'+curPiece+'.src');
    f[Y][X]=-curPiece;
   }
   X=xToErase[k];
   Y=yToErase[k];
   if (f[Y][X]==0) eval('self.document.s'+Y+'_'+X+'.src=Img0.src');
  }
 }
}

function drawNextPiece() {
 if (document.images) {
 for (var i=0;i<4;i++) {
  for (var j=0;j<4;j++) {
   f[i][j]=0;
   if (boardLoaded) eval('self.document.d'+i+'_'+j+'.src="'+ImgWhite.src+'"');
  }
 }

  for (var k=0;k<4;k++) {
   X=curX+dx2[k];
   Y=curY+dy2[k];
   if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth && f[Y][X]!=-nextPiece) {
    eval('self.document.d'+Y+'_'+X+'.src=Img'+nextPiece+'.src');
    f[Y][X]=-nextPiece;
   }
  }
 }
}

function erasePiece() {
 if (document.images && boardLoaded) {
  for (var k=0;k<nSquares;k++) {
   X=curX+dx[k];
   Y=curY+dy[k];
   if (0<=Y && Y<boardHeight && 0<=X && X<boardWidth) {
    xToErase[k]=X;
    yToErase[k]=Y;
    f[Y][X]=0;
   }
  }
 }
}

function pieceFits(X,Y) {
 for (var k=0;k<nSquares;k++) {
  theX=X+dx_[k];
  theY=Y+dy_[k];
  if (theX<0 || theX>=boardWidth || theY>=boardHeight) return 0;
  if (theY>-1 && f[theY][theX]>0) return 0;
 }
 return 1;
}

function moveleft() {
 for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
 if (pieceFits(curX-1,curY)) {erasePiece(); curX--; drawPiece();}
}

function moveright() {
 for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
 if (pieceFits(curX+1,curY)) {erasePiece(); curX++; drawPiece();}
}

function rotate() {
 for (var k=0;k<nSquares;k++) {dx_[k]=dy[k]; dy_[k]=-dx[k];}
 if (pieceFits(curX,curY)) {
  erasePiece(); 
  for (var k=0;k<nSquares;k++) {dx[k]=dx_[k]; dy[k]=dy_[k];}
  drawPiece();
 }
}

function movedown() {
 for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
 if (pieceFits(curX,curY+1)) {erasePiece(); curY++; drawPiece(); return 1; }
 return 0;
}

function fall() {
 for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
 if (!pieceFits(curX,curY+1)) return;
 clearTimeout(timerID);
 erasePiece();
 while (pieceFits(curX,curY+1)) curY++;
 drawPiece();
 timerID=setTimeout("play()",speed);
}

function setNextPiece(){
    nextPiece = 1+Math.floor(nTypes*Math.random());
    curX=2;
    curY=0;
    for (var k=0;k<nSquares;k++) {
      dx2[k]=dxBank[nextPiece][k]; 
      dy2[k]=dyBank[nextPiece][k];
    }

    drawNextPiece();
}

function getPiece(N) {
    if (getPiece.arguments.length===0) {
        curPiece = nextPiece;
        setNextPiece();
    } else {
        curPiece = N;
    }

 curX=5;
 curY=0;
 for (var k=0;k<nSquares;k++) {
  dx[k]=dxBank[curPiece][k]; 
  dy[k]=dyBank[curPiece][k];
 }
 for (var k=0;k<nSquares;k++) {dx_[k]=dx[k]; dy_[k]=dy[k];}
 if (pieceFits(curX,curY)) { drawPiece(); return 1; }
 return 0;
}

// mouse clicks processing

function getMinMax() {
 xMax=curX; 
 xMin=curX; 
 yMax=curY;
 for (var k=1;k<nSquares;k++) {
  if (curX+dx[k]>xMax) xMax=curX+dx[k];
  if (curX+dx[k]<xMin) xMin=curX+dx[k];
  if (curY+dy[k]>yMax) yMax=curY+dy[k];
 }
}

function clk(yClk,xClk) {
 if (!gameStarted || !boardLoaded) return;
 if (gamePaused) resume();
 top.focus();
 getMinMax();
 if (yClk>yMax) {movedown(); return;}
 if (xClk<xMin) {moveleft(); return;}
 if (xClk>xMax) {moveright(); return;}
 rotate(); return;
}

// onresize=function(){if(navigator.appName=="Netscape" && parseInt(navigator.appVersion)==4)setTimeout("top.f1.location=''+top.f1.location",150);}


// keystroke processing

initialDelay_=200;
repeat_Delay_=20;

activeL_=0; timerL_ = null;
activeR_=0; timerR_ = null;
activeU_=0; timerU_ = null;
activeD_=0; timerD_ = null;
activeSp=0; timerSp = null;

LeftNN_ =' 52 ';
RightNN_=' 54 ';
UpNN_   =' 56 53 ';
DownNN_ =' 50 ';
SpaceNN_=' 32 ';

LeftIE_ =' 37 52 100 ';
RightIE_=' 39 54 102 ';
UpIE_   =' 38 56 53 104 101 ';
DownIE_ =' 40 50 98 ';
SpaceIE_=' 32 ';

function keyDown(e) {
 var KeyNN_=0;
 var KeyIE_=0;
 var evt = e ? e:event;
 KeyNN_=evt.keyCode;
 KeyIE_=evt.keyCode;

 if (!gameStarted || !boardLoaded || gamePaused) return;

 //self.status='KeyNN_='+KeyNN_+', KeyIE_='+KeyIE_;
 //alert('KeyNN_='+KeyNN_+', KeyIE_='+KeyIE_);

 if (!activeL_ && ( LeftNN_.indexOf(' '+KeyNN_+' ')!=-1  
                   || LeftIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
 {
  activeL_ = 1;
  activeR_ = 0;
  moveleft();
  timerL_=setTimeout("slideL_()",initialDelay_);
 }

 if (!activeR_ && (RightNN_.indexOf(' '+KeyNN_+' ')!=-1 
                   || RightIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
 {
  activeR_ = 1;
  activeL_ = 0;
  moveright();
  timerR_=setTimeout("slideR_()",initialDelay_);
 }

 if (!activeU_ && (UpNN_.indexOf(' '+KeyNN_+' ')!=-1
                || UpIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
 {
  activeU_ = 1;
  activeD_ = 0;
  rotate();
 }

 if (!activeSp && (SpaceNN_.indexOf(' '+KeyNN_+' ')!=-1
                || SpaceIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
 {
  activeSp = 1;
  activeD_ = 0;
  fall();
 }

 if (!activeD_ && (DownNN_.indexOf(' '+KeyNN_+' ')!=-1
                  || DownIE_.indexOf(' '+KeyIE_+' ')!=-1)) 
 {
  activeD_ = 1
  activeU_ = 0
  movedown();
  timerD_=setTimeout("slideD_()",initialDelay_);
 }
}

function keyUp(e) {
 var KeyNN_=0;
 var KeyIE_=0;

 var evt = e?e:event;
 //alert('evt.keyCode='+evt.keyCode);

 KeyNN_=evt.keyCode;
 KeyIE_=evt.keyCode;

 if (LeftNN_.indexOf(' '+KeyNN_+' ')!=-1  || LeftIE_.indexOf(' '+KeyIE_+' ')!=-1)  {activeL_=0; clearTimeout(timerL_)}
 if (RightNN_.indexOf(' '+KeyNN_+' ')!=-1 || RightIE_.indexOf(' '+KeyIE_+' ')!=-1) {activeR_=0; clearTimeout(timerR_)}
 if (UpNN_.indexOf(' '+KeyNN_+' ')!=-1    || UpIE_.indexOf(' '+KeyIE_+' ')!=-1)    {activeU_=0; clearTimeout(timerU_)}
 if (DownNN_.indexOf(' '+KeyNN_+' ')!=-1  || DownIE_.indexOf(' '+KeyIE_+' ')!=-1)  {activeD_=0; clearTimeout(timerD_)}
 if (SpaceNN_.indexOf(' '+KeyNN_+' ')!=-1 || SpaceIE_.indexOf(' '+KeyIE_+' ')!=-1) {activeSp=0; clearTimeout(timerSp)}

 top.focus();
}

function slideL_() {
 if (activeL_) {
  moveleft();
  timerL_=setTimeout("slideL_()",repeat_Delay_);
 }
}

function slideR_() {
 if (activeR_) {
  moveright();
  timerR_=setTimeout("slideR_()",repeat_Delay_);
 }
}

function slideD_() {
 if (activeD_) {
  movedown();
  timerD_=setTimeout("slideD_()",repeat_Delay_);
 }
}

//function slideU_() {
// if (activeU_) {
//  moveup();
//  timerU_=setTimeout("slideU_()",repeat_Delay_);
// }
//}

function init() {
 document.onkeydown = keyDown;
 document.onkeyup = keyUp;
 // if (ns4) document.captureEvents(Event.KEYDOWN | Event.KEYUP);

 resetGame();
 top.focus();
}

//-->
