var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr); //THIS CAN BE REMOVED LATER sv 6.21.22
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//~~~~THE FOLLOWING IS CODE WRITTEN IN MODULE 6.21.22 <All of this will be used in the challenge to update the tasks in the calendar>
//~~~~This was from week 1 of the module, and the follwing is used to edit current information.
$(".list-group").on("click","p", function() {
  var text = $(this)
  .text()
  .trim();

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

    $(this).replaceWith(textInput);
    textInput.trigger("focus");
  console.log(text); // consolelog
});

$(".list-group").on("blur","textarea", function() {
  //get the textareas current value/text
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  //recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace textarea with p element
  $(this).replaceWith(taskP);
});

//This is to update the due date for the task DYNAMIC DATEPICKER IS HERE!
$(".list-group").on("click", "span", function() {
  //get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")
    .attr("type","text")
    .addClass("form-control")
    .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

    //enable jQuery ui datepicker DATEPICKER HERE
    dateInput.datepicker({
      minDate: 1,
      onClose: function() {
        //when calendar is closed, force a "change" event on the dateInput
        $(this).trigger("change");
      }
    });

  //automatically bring up the calender
  dateInput.trigger("focus");
});

//once the value of the date was changed:
$(".list-group").on("change", "input[type='text']", function() {

  //get current text
  var date = $(this)
    .val()
    .trim();

  //get the parent uls id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the tasks position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and resave to localStorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

  //pass tasks <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

//This makes the lists in the task master draggable list to list
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    //console.log("activate", this);
  },

  deactivate: function(event) {
    //console.log("deactivate", this);
  },

  over: function(event) {
    //console.log("over", event.target);
  },

  out: function(event) {
    //console.log("out", event.target);
  },

  update: function(event) {
    //array to store the task data in
    var tempArr = [];
    //loop over current set of children in sortable list
    $(this).children().each(function() {

      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      //add the task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    }); 

    //trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-","");

    //update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

//THIS FUNCTION IS FOR DRAGGING TO THE TRASHBIN
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },

  over: function(event, ui) {
    console.log("over");
  },

  out: function(event, ui) {
    console.log("out");
  }

});

$("#modalDueDate").datepicker({

  minDate: 1

});

var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl).find("span").text().trim();

  //convert to moment object @ 5:00 pm
  var time = moment(date, "L").set("hour", 17);

  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if the task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};
//THE ABOVE IS CODE WRITTEN IN THE MODULES

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


