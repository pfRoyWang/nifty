const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');

var utils = require('./utils');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.listen(8080,function(){
	console.log('Server is up on port 8080');
	utils.init();
});

hbs.registerPartials(__dirname+'/views/partials');

//app.use(express.static(__dirname + '/views/img'))
app.set('view engine','hbs')
app.use(express.static(__dirname + '/public'));


hbs.registerHelper('getCurrentYear',()=>{
	return new Date().getFullYear();
})

app.get('/', (request, response) => {
    response.send('<h1>Hello!</h1>');
});



app.get('/register',function(request,response){
	response.render('register.hbs',{
		title:"Register Page",
		pagename:"Register Page",
		year: new Date().getFullYear()
	});
});

app.get('/login',function(request,response){
	response.render('login.hbs',{
		title:"Login Page",
		pagename:"Login Page",
		year: new Date().getFullYear()
	});	
});

app.get('/menu',function(request,response){

	var db = utils.getDb();
	docs = db.collection('menu').find().toArray(function(err,docs){
		if (err){
			response.send('Unable to get the menu');
		}else{
			response.render('menu.hbs',{
				menu:docs,
				title:"Menu Page",
				pagename:"Menu Page",
				year: new Date().getFullYear()
			});
		}
	});
});

app.post('/login',function(request,response){
	var usrname = request.body.usrname,
		password = request.body.password;

	var db = utils.getDb();

	db.collection('users').findOne({'usrname':usrname,'password':password},function(err,doc){
		if(err) throw err;
		if (doc){
			response.redirect(301,'/')
		}else{
			response.redirect(301,'loginerror')
		}
	})
		
});

app.get('/loginerror',function(request,response){
	response.render('login_error.hbs',{
		title:"Login Page",
		pagename:"Login Page",
		year: new Date().getFullYear(),
		message:'User name or password is not correct, please try again'
	})
})


app.get('/reerror',function(request,response){
	response.render('register_error.hbs',{
		title:"Register Page",
		pagename:"Register Page",
		year: new Date().getFullYear(),
		message:'User name already existed, please try again!'
	})
})

app.post('/register',function(request,response){
	var usrname = request.body.usrname;
	var password = request.body.password;
	var confirmpw = request.body.confirmpw;
	var email = request.body.email;

	var db = utils.getDb();


	db.collection('users').count({'usrname':usrname})
		.then((count)=>{
			if(count>0){
				response.redirect(301,'/reerror');
			}else{
				db.collection('users').insertOne({
					usrname: usrname,
					password: password,
					confirmpw: confirmpw,
					email:email
				},(err,result)=>{
					if (err){
						response.send('Unable to insert user');
					}
				});
			}
		});
	//response.redirect(301,'/login');
});


