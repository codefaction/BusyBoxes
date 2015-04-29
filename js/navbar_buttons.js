$("button#run_toggle").click(function(){
  toggleRunning()
  if (IS_RUNNING){
    //turn into pause button
    $(this).html('<i class="fa fa-pause"></i> Pause');
    
  }else{
    //turn into play button
    $(this).html('<i class="fa fa-play"></i> Play');
    
  }
});

$("button#fast_forward").click(function(){
  fastSlow()
  if(processSpeed == "slow"){
    $(this).html('<i class="fa fa-fast-forward"></i><i> SPEED UP</i>');
  }else{
    $(this).html('SLOW DOWN</i>');
  }

});

$("button#step_through").click(function(){
  IS_RUNNING = true;
  mainLoop();
  IS_RUNNING = false;
});


