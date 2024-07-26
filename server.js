/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: SUSMITA BHAGAT Student ID: 121361232 Date: 
*
*  Online (vercel) Link:https://assignment4-liard-tau.vercel.app/
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
      navLink: function(url, options) {
          return '<li' +
              ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
              '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function(lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      }
  }
});

const path = require('path');
const collegeData = require('./modules/collegeData');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Page' });
});

app.get('/htmlDemo', (req, res) => {
  res.render('htmlDemo', { title: 'HTML Demo Page' });
});




app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

app.get('/students', (req, res) => {
  const course = req.query.course;
  if (course) {
    collegeData.getStudentsByCourse(course).then((data) => {
      if (data.length > 0) {
        res.render("students", { students: data });
      } else {
        res.render("students", { message: "no results" });
      }
    }).catch((err) => {
      res.render("students", { message: "no results" });
    });
  } else {
    collegeData.getAllStudents().then((data) => {
      if (data.length > 0) {
        res.render("students", { students: data });
      } else {
        res.render("students", { message: "no results" });
      }
    }).catch((err) => {
      res.render("students", { message: "no results" });
    });
  }
});

app.get('/students/add', (req, res) => {
  res.render('addStudent', { title: 'Add Student' });
});



app.post('/students/add',(req,res)=>{
  collegeData.addStudent(req.body)
  .then(()=>  res.redirect('/students'))
  .catch((err) => {
    console.error('Error adding student: ', err);
    res.status(500).send('Error adding student');
    });
  })


app.get('/student/:num', (req, res) => {
  const stunum = req.params.num;
  if (stunum) {
    let viewData = {};
    collegeData.getStudentByNum(stunum).then((data) => {
      if (data) {
        viewData.student = data; // Store student data in viewData
      } else {
        res.render('student', { message: "no results" });
      }
    }).catch((err) => {
      res.render('student', { message: "no results" });
    }).then(collegeData.getCourses).then((data) => {
      viewData.courses = data; // Store course data in viewData
      // Check if we found the student
      if (viewData.student == null) {
        res.render('student', { message: "no results" });
      } else {
        res.render('student', { student: viewData.student, courses: viewData.courses });
      }
    }).catch((err) => {
      res.render('student', { message: "no results" });
    });
  } else {
    res.render('student', { message: "no results" });
  }
});

//added for student update
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


//added for student update
app.post("/student/update", (req, res) => {
  collegeData.updateStudent(req.body).then(() => {
      res.redirect("/students");
  }).catch((err) => {
      res.status(500).send("Unable to update student");
  });
});

app.get('/courses', (req, res) => {
  collegeData.getCourses().then((data) => {
    if (data.length > 0) {
      res.render('courses', { courses: data });
    } else {
      res.render('courses', { message: "no results" });
    }
  }).catch((err) => {
    res.render('courses', { message: "no results" });
  });
});

app.get('/course/:id', (req, res) => {
  const id = req.params.id;
  collegeData.getCourseById(id).then((data) => {
    if (data) {
      res.render('course', { course: data });
    } else {
      res.render('course', { message: "no results" });
    }
  }).catch((err) => {
    res.render('course', { message: "no results" });
  });
});










app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

collegeData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Server is running on http://localhost:" + HTTP_PORT);
  });
}).catch((err) => {
  console.log(`Failed to initialize data :${err}`);

});