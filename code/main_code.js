
function submitHIT() {
    var submitUrl = config.hitCreation.production ? MTURK_SUBMIT : SANDBOX_SUBMIT;
    state.gender.push($("#gender").val());
    saveTaskData();
    clearMessage();
    $("#submit-button").addClass("loading");
    var form = $("#submit-form");
    for (var i = 0; i < config.meta.numSubtasks; i++) {
        var err = custom.validateTask(getTaskInputs(i), i, getTaskOutputs(i));
        if (err) {
            $("#submit-button").removeClass("loading");
            generateMessage("negative", err);
            return;
        }
    }

    addHiddenField(form, 'assignmentId', state.assignmentId);
    addHiddenField(form, 'workerId', state.workerId);
    var results = {
        'inputs': state.taskInputs,
        'outputs': state.taskOutputs
    };
    addHiddenField(form, 'results', JSON.stringify(results));
    var times = {
        'time':state.timeOutputs,
        'actions':state.action
    };
    addHiddenField(form, 'times', JSON.stringify(times));
    addHiddenField(form, 'feedback', $("#feedback-input").val());
    addHiddenField(form, 'gender', state.gender);

    $("#submit-form").attr("action", submitUrl); 
    $("#submit-form").attr("method", "POST"); 
    $("#submit-form").submit();
    $("#submit-button").removeClass("loading");
    generateMessage("positive", "Thanks! Your task was submitted successfully.");
    $("#submit-button").addClass("disabled");
}

function setupButtons() {
    $("#next-button").click(nextTask);
    $("#consent-button").click(toggleInstructions);
    $(".instruction-button").click(toggleInstructions);
    $("#submit-button").click(submitHIT);
    if (state.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        $("#submit-button").remove();
    }
}

function clearMessage() {
    $("#message-field").html("");
}

function addHiddenField(form, name, value) {
    // form is a jQuery object, name and value are strings
    var input = $("<input type='hidden' name='" + name + "' value=''>");
    input.val(value);
    form.append(input);
}


function saveTaskData() {
    if (config.meta.aggregate) {
        var timestamp = Date.now();
        var times = state.timeOutputs.push(timestamp);
        var updates = custom.collectData(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
        $.extend(state.taskOutputs, updates);
    } else {
        var timestamp = Date.now();
        state.timeOutputs.push(timestamp);
        state.taskOutputs[state.taskIndex] = custom.collectData(getTaskInputs(state.taskIndex), state.taskIndex, getTaskOutputs(state.taskIndex));
    }
}


/* MAIN */
$(document).ready(function() {
    $.getJSON("config.json").done(function(data) {
        config = data;
        if (config.meta.aggregate) {
            state.taskOutputs = {};
        }
        custom.loadTasks(config.meta.numSubtasks).done(function(taskInputs) {
        $.getJSON("questions.json").done(function(data) { questions=data;
            state.taskInputs = questions.quest;
            populateMetadata(config);
            setupButtons(config);
        });
      });
    });
});
