			window.onload = function(){
				window.adress = '26';
				window.hostname = 'titi';
				
				var containerType = null;

                var config = {
                    openSocket: function(config) {
                        var channel = config.channel || window.adress; //location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
                        var socket = new Firebase('https://webrtc.firebaseIO.com/' + channel);
                        socket.channel = channel;
                        socket.on("child_added", function(data) {
                            config.onmessage && config.onmessage(data.val());
                        });
                        socket.send = function(data) {
                            this.push(data);
                        };
                        config.onopen && setTimeout(config.onopen, 1);
                        socket.onDisconnect().remove();
                        return socket;
                    },
                    onRemoteStream: function(media,filter) {
	
							var mediaElement = getMediaElement(media.video, {
								width: (videosContainer.clientWidth / 2) - 50,
								buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
							});
						
						//}
						mediaElement.id = media.streamid;
						videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
						media.stream.oninactive = function(){
							videosContainer.removeChild(mediaElement);
							}
						//mediaElement.firstChild.nextSibling.nextSibling.firstChild.setAttribute("class", media.filter);
					},
                    onRemoteStreamEnded: function(stream, video) {
                        if (video.parentNode && video.parentNode.parentNode && video.parentNode.parentNode.parentNode) {
                            video.parentNode.parentNode.parentNode.removeChild(video.parentNode.parentNode);
                        }
                    },
                    onRoomFound: function(room) {			
											
                        var alreadyAudio = document.querySelector('.joinAudio');
						var alreadyVideo = document.querySelector('.joinVideo');
                        if (alreadyAudio && alreadyVideo) return;
						var tr = document.createElement('tr');
						
                        if (typeof roomsList === 'undefined') roomsList = document.body;
						
						if (!(document.querySelector('.joinAudio'))&& !(document.querySelector('.joinVideo'))){
							tr.innerHTML = '<td><strong>' + room.roomName + '</strong> a créé une conversation </td>' +
                            '<td><button class="joinAudio">Rejoindre en vocal</button><button class="joinVideo">Rejoindre en video</button></td>';
							document.getElementById('setup-new-audio').disabled = true;
							document.getElementById('setup-new-audio').style.visibility='hidden';
							document.getElementById('setup-new-room').disabled = true;
							document.getElementById('setup-new-room').style.visibility='hidden';
						}
						
						
						
						roomsList.insertBefore(tr, roomsList.firstChild);
						
						

                        var joinAudioButton = tr.querySelector('.joinAudio');
						if (joinAudioButton){
							joinAudioButton.setAttribute('data-broadcaster', room.broadcaster);
							joinAudioButton.setAttribute('data-roomToken', room.roomToken);
							joinAudioButton.setAttribute('data-roomType', room.roomType);
							joinAudioButton.onclick = function() {
								document.getElementById('rooms-list').style.visibility='visible';
								if(btnSetupNewAudio){
									btnSetupNewAudio.disabled = true;
									btnSetupNewAudio.style.visibility='hidden';
								}
								if(btnSetupNewRoom){
									btnSetupNewRoom.disabled = true;
									btnSetupNewRoom.style.visibility='hidden';
								}
								tr.innerHTML="";
								var broadcaster = this.getAttribute('data-broadcaster');
								var roomToken = this.getAttribute('data-roomToken');
								var type = 'Audio';
								captureUserMedia(type,function() {
									conferenceUI.joinRoom({
										roomToken: roomToken,
										joinUser: broadcaster
									});
								}, function() {
									document.getElementById('rooms-list').style.visibility='visible';
									
								});
							};
						}
						
						var joinRoomButton = tr.querySelector('.joinVideo');
						if(joinRoomButton){
							joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
							joinRoomButton.setAttribute('data-roomToken', room.roomToken);
							joinRoomButton.onclick = function() {
								document.getElementById('rooms-list').style.visibility='hidden';

								var broadcaster = this.getAttribute('data-broadcaster');
								var roomToken = this.getAttribute('data-roomToken');
								var type ='Video';
								captureUserMedia(type,function() {
									conferenceUI.joinRoom({
										roomToken: roomToken,
										joinUser: broadcaster
									});
								}, function() {
									document.getElementById('rooms-list').style.visibility='visible';
									
								});
							};
						}
                    },
                    onRoomClosed: function(room) {
                        var joinButton = document.querySelector('button[data-roomToken="' + room.roomToken + '"]');
                        if (joinButton) {
                             joinButton.parentNode.parentNode.parentNode.removeChild(joinButton.parentNode.parentNode);
                        }
						if(room.roomType='Audio'){
							btnSetupNewAudio.disabled = false;
							btnSetupNewAudio.style.visibility='visible';
						}else if(room.roomType='Video'){
							btnSetupNewRoom.disabled = false;
							btnSetupNewRoom.style.visibility='visible';
						}
                    }
                };
				
				

                function setupNewAudioButtonClickHandler() {
                    btnSetupNewAudio.disabled = true;
					btnSetupNewAudio.style.visibility='hidden';
					btnSetupNewRoom.disabled = true;
					btnSetupNewRoom.style.visibility='hidden';
					var type = 'Audio';
                    captureUserMedia(type,function() {
                        conferenceUI.createRoom({
                            roomName: window.hostname,
							
                        });
                    }, function() {
                        btnSetupNewAudio.disabled = false;
                    });
                }
				
				function setupNewVideoButtonClickHandler() {
                    btnSetupNewRoom.disabled = true;
					btnSetupNewAudio.style.visibility='hidden';
					btnSetupNewAudio.disabled = true;
					btnSetupNewRoom.style.visibility='hidden';
					var type = 'Video';
                    captureUserMedia(type,function() {
                        conferenceUI.createRoom({
                            roomName: window.hostname,
					
                        });
                    }, function() {
                        btnSetupNewRoom.disabled = false;
                    });
                }

				
				function captureUserMedia(type, callback, failure_callback) {
					var video = document.createElement('video');
					
					containerType = type;

                    getUserMedia({
						//filter: 'blur',
                        video: video,
                        onsuccess: function(stream) {
							if (!(stream.getVideoTracks()[0] === undefined) && type =='Audio'){
								stream.getVideoTracks()[0].enabled = false;
							}
							window.myVideoTrack = stream.getVideoTracks()[0];
							
							config.attachStream = stream;
							//config.filter= 'invert';
                            callback && callback();
							window.myStream = stream;
							window.myAudioTrack = window.myStream.getAudioTracks()[0];
                            video.setAttribute('muted', true);
							//if (type =='Video'){
							var mediaElement = getMediaElement(video, {
								width: (videosContainer.clientWidth / 2) - 50,
								buttons: ['mute-audio', 'mute-video', 'full-screen', 'stop']
							});
							
                            videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
							
							var thisControl = mediaElement.firstChild.firstChild.nextSibling;
							
							thisControl.onclick=function(event)
								{ 	
									var point = event.target;
									muteAudio(point);
									};
							if (!(window.myVideoTrack === undefined)){
								var thisVideo = mediaElement.firstChild.firstChild.nextSibling.nextSibling;
								if (type == 'Video'){
								thisVideo.onclick=function(event)
									{ 	
									var point = event.target;
									cutVideo(point);
										};
								}else{
									thisVideo.setAttribute('class', 'control unmute-video selected')
									thisVideo.onclick=function(event)
									{ 	
									var point = event.target;
									uncutVideo(point);
										};
									
								}
							}	
							
							var thisQuit = mediaElement.firstChild.firstChild.nextSibling.nextSibling.nextSibling;
							thisQuit.onclick=function()
								{ 	
									var point = stream;
									quitChat(point);
									};	
							
							var lbl = document.createElement('div');
							lbl.setAttribute('class', "control");
							lbl.innerHTML= '<span style="padding-left:30px;">'+window.hostname + '</span>';
							lbl.style="color:black;font-size:25px;opacity: 1;width:190px;";
							videosContainer.firstChild.firstChild.insertBefore(lbl, videosContainer.firstChild.firstChild.firstChild);
							//mediaElement.firstChild.nextSibling.nextSibling.firstChild.setAttribute("class", 'none');
							
							
							
							
                        },
                        onerror: function() {
                            alert('unable to get access to your webcam');
                            callback && callback();
                        }
                    });
                }
				
				
				function muteAudio(point){
					window.myAudioTrack.enabled = false;
					point.setAttribute('class', 'control unmute-audio selected')
					point.onclick = function(event) {
						var point = event.target ;
						unmuteAudio(point);
					};
				}
				function unmuteAudio(point){
					window.myAudioTrack.enabled = true;
					point.setAttribute('class', 'control mute-audio')
					point.onclick = function(event) {
						var point = event.target ;
						muteAudio(point);
						};
				}
				function cutVideo(point){
					window.myVideoTrack.enabled = false;
					point.setAttribute('class', 'control unmute-video selected')
					point.onclick = function(event) {
						var point = event.target ;
						uncutVideo(point);
						};
				}
				function uncutVideo(point){
					window.myVideoTrack.enabled = true;
					point.setAttribute('class', 'control mute-video')
					point.onclick = function(event) {
						var point = event.target ;
						cutVideo(point);
						};
				}

                var conferenceUI = conference(config);
				
			

                
			
				var videosContainer = document.getElementById('video-container') || document.body;
                var btnSetupNewRoom = document.getElementById('setup-new-room');
				var btnSetupNewAudio = document.getElementById('setup-new-audio');
                var roomsList = document.getElementById('rooms-list');

                
				
                if (btnSetupNewAudio) btnSetupNewAudio.onclick = setupNewAudioButtonClickHandler;
				if (btnSetupNewRoom) btnSetupNewRoom.onclick = setupNewVideoButtonClickHandler;

                function rotateVideo(video) {
                    video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
                    setTimeout(function() {
                        video.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
                    }, 1000);
                }

				 function scaleVideos() {
                    var videos = document.querySelectorAll('video'),
                        length = videos.length, video;

                    var minus = 130;
                    var windowHeight = 700;
                    var windowWidth = 600;
                    var windowAspectRatio = windowWidth / windowHeight;
                    var videoAspectRatio = 4 / 3;
                    var blockAspectRatio;
                    var tempVideoWidth = 0;
                    var maxVideoWidth = 0;

                    for (var i = length; i > 0; i--) {
                        blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
                        if (blockAspectRatio <= windowAspectRatio) {
                            tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
                        } else {
                            tempVideoWidth = windowWidth / i;
                        }
                        if (tempVideoWidth > maxVideoWidth)
                            maxVideoWidth = tempVideoWidth;
                    }
                    for (var i = 0; i < length; i++) {
                        video = videos[i];
                        if (video)
                            video.width = maxVideoWidth - minus;
                    }
                }
				
				function quitChat(point){
						point.getTracks().forEach(track => track.stop());
						location.reload();
					
				}

			window.onresize = scaleVideos;
			};