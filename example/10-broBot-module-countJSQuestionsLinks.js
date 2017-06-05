broBot.modules.register('countJSQuestionsLinks', {
	// Used for debug
	// 
	// @optional
	name: 'countJSQuestionsLinks',

	// @optional
	// @return true
	init: function(){

		// Define 'lastCheckedID' data element to remember 
		if(typeof broBot.data.lastCheckedID == 'undefined')
		{
			broBot.data.lastCheckedID = 0;
			broBot.data.questionsTotal = 0;
			broBot.data.linksTotal = 0;
			broBot.data.linksPerQuestion = 0;
			broBot.data.save();

			broBot.timers.countJSQuestionsLinks = 0;
			broBot.timers.save();
		}
		return true;
	},
	
	// Tests if this module's walker should be started.	
	//
	// @required
	test: function(){

		// we will run only if time comes
		// we will set this timer later
		if( broBot.timers.countJSQuestionsLinks < (new Date()).getTime()  ){
			return true;
		}

		return false;
	},
	walker: {
		// Module/walker-action name. Used to store walker status
		//
		// @required
		action: 'countJSQuestionsLinks',
		
		// Called before every next sequence element. Can used as a showstopper
		// if situation changed from outside
		//
		// @optional
		// @return true if current sequence element can be called, false otherwise
		pre: function(){
			return true;
		},
		
		// Sequence of actual actions to be performed. Every next function is called after page refresh
		sequence: Array(
			
			function(){ 
				// stackoverflow uses jQuery so we can use it too

				// get questions list
				var questions_list = $('#question-mini-list').children();

				// walk through current questions, looking for 'javascript' tags
				// order is reversed coz new questions are placed top, while we need 
				// to start from 'old' ones

				var found = null;

				for (var i = questions_list.length - 1; i >= 0; i--) {

					var question_container = $(questions_list[i]);

					var qid = question_container.attr('id').replace(/[^0-9]/g,'');

					// this question has the javascript tag and its newer
					// than the last we already checked
					if(
						question_container.find('.tags').hasClass('t-javascript')
						&& Number(qid) > Number(broBot.data.lastCheckedID)
					){
						broBot.data.lastCheckedID = qid;
						broBot.data.save()

						found = true;

						// found the question we want to inspect, so we just go on
						window.location.assign(question_container.find('a.question-hyperlink').attr('href'));

						break;
					}
				}

				// no new question found, time to create and show report
				if(!found){

					var report = "";

					if(broBot.data.questionsTotal > 0){
						broBot.data.linksPerQuestion = Number(broBot.data.linksTotal) / Number(broBot.data.questionsTotal);

						report += "Questions total: " + broBot.data.questionsTotal + "\n";
						report += "Links total: " + broBot.data.linksTotal + "\n";
					} else {
						report = "No new questions found.\n";
					}

					report += "\nLinks per question overall: " + broBot.data.linksPerQuestion + "\n";

					report += "\nWill check for new questions in 5 minutes\n";

					alert(report);

					// now we want to stop this module's sequence to be run
					this.clear();

					// almost done; we need to set timer, otherwise
					// this module's sequence will be run again and again
					// on a list we already proceeded
					// waiting 5 minutes instead
					broBot.timers.countJSQuestionsLinks = (new Date()).getTime() + 5*60*1000;
					broBot.timers.save();

					// to allow broBot start the new test sequence we need to reload the page
					// this module test will return 'false' and broBot will wait for time set
					// above to come to call modules test functions again
					window.location.reload()

					// This module's test function does not always return true,
					// broRot is not halted when all the modules return 'false'
					// It looks at his 'timers' object instead and shedules next
					// itteration at the closest one.					
				}

			}
			, function(){ 
				// now we are at the individual question page, lest grab some info

				// increase the questions count, we will need it later
				broBot.data.questionsTotal++;

				// count question links amount
				broBot.data.linksTotal += $('.post-text').find('a').length;

				// save it
				broBot.data.save();
				
				// we'r done for this question, we just go to main page;
				// since this the last thing we gonna do, walker will 
				// start testing all the modules again to find one
				// which will be launched. So, after we'r back to main
				// page, module's test function will be run and the whole 
				// sequence will repeat while we have new questions

				window.location.assign("/");
			}
		),
		__proto__: broBot.walker
	}
	
})
