exports.action = function(xml, callback, config, SARAH) {
var config = config.modules.courses;
var filePath = './plugins/courses/courses.json'; // Chemin vers courses.json
var filePath_liste = './plugins/courses/courses_liste.txt'; // Chemin vers courses_liste.txt
var fs = require('fs');

// Rajoute un item au fichier courses.txt
if(xml.item != null) {	
 
fs.readFile(filePath, function(err, data) { // read file to memory
if (err) throw err;
//console.log(data);
    
var objet = JSON.parse(data);
var dataObj = '{ "item" : ' + xml.item + " }"; // le format est {"item" : "valeur"}
var longueur = objet.courses.length; // le nombre de valeurs
var jsonStr = JSON.stringify(objet); // transforme l'objet en texte
    		  
if (jsonStr.indexOf(xml.item) > -1  ){ // Si la valeur existe deja dans le fichier courses.json
//console.log("Objet Existant"); 

callback({'tts' : "L'objet " + xml.item + ", est deja present dans la liste de course"}); // retourne Objet existant 
     
}
else 
{ 
objet.courses.push({item: xml.item}); //rajoute dans l'objet au fichier 
new_jsonStr = JSON.stringify(objet);
fs.writeFile(filePath, new_jsonStr, function (err) { // ecrit dans le fichier courses l'objet + la nouvelle valeur
if (err) throw err;
console.log("valeur rajoutée : "+ new_jsonStr); 
callback({'tts' : "je rajoute l'objet : " + xml.item});
 });
}
//console.log(chaine);
return;
 });
 }
 // enlève un item
if(xml.item_out != null) {
fs.readFile(filePath, function(err, data) { // read file to memory
   if (err) throw err;
//console.log(data);
var objet = JSON.parse(data);   
var jsonStr = JSON.stringify(objet);
if (jsonStr.indexOf(xml.item_out) > -1  ){ // look for the entry with a matching `code` value
console.log(jsonStr.indexOf(xml.item_out)); 
var removed =  objet.courses.splice(jsonStr.indexOf(xml.item_out) ,1);
console.log(objet.courses.length);
//delete objet.courses.[xml.item_out]item;
for (var i = 0; i < objet.courses.length ;i++){  // look for the entry with a matching `code` value
if (objet.courses[i].item == xml.item_out){
console.log(objet.courses[i].item); 
objet.courses.delete({item: xml.item_out}); //enleve dans l'objet au fichier 
new_jsonStr = JSON.stringify(objet);
fs.writeFile(filePath, new_jsonStr, function (err) { // ecrit dans le fichier courses l'objet + enleve la valeur
if (err) throw err;   
SARAH.speak("j'enléve l'objet : " + xml.item_out); 
 }); 
}     
}
}

else 
{ 
SARAH.speak("objet inexistant");
}});	 
callback();
} 

// Envoie en notification push
if (xml.push != null){
console.log("Destinataire = "+ xml.qui);
fs.writeFile(filePath_liste,"","UTF-8");  //met le fichier courses_liste.txt a zéro 

fs.readFile(filePath,"UTF-8", function(err, data) { // read file to memory
if (err) throw err;
   
var objet = JSON.parse(data);
var longueur = objet.courses.length; // le nombre de valeurs dans le fichier courses.json
var jsonStr = JSON.stringify(objet); // transforme l'objet en texte

var utilisateur = xml.qui
console.log("Nombre de valeurs :"+longueur);
if ( longueur > 0){   
for (var i = 0; i < objet.courses.length ;i++){   
//console.log("Valeur a rajouter "+objet.courses[i].item); 
//console.log(i);
 fs.appendFileSync(filePath_liste, objet.courses[i].item+"\n","UTF-8", function (err) { // ecrit dans le fichier courses l'objet + la nouvelle valeur
if (err) throw err;           
 });
}
fs.readFile(filePath_liste,"UTF-8", function(err, data2) { // Données à envoyer
if (err) throw err;
console.log(data2);
// console.log("liste des courses : \n"+data2+";"); 
var url = "http://127.0.0.1:8080/sarah/push?who="+xml.qui+"&Title=Liste_courses&msg="+data2
var request = require ("request");
request({'uri' : url}, function (err, response, body) {
//console.log("J'envoie à "+ xml.qui + " la liste des courses");	
});

});
SARAH.speak("J'envoie à "+ xml.qui + " la liste des courses");
//callback({'tts' : "J'envoie à "+ xml.qui + " la liste des courses"});
}
else {
SARAH.speak( "Il n'y a pas de liste de courses");
//callback({'tts' : "Il n'y a pas de liste de courses"});
}

});
//fs.writeFile(filePath_liste,"","UTF-8");  
callback();
}

//Donne la liste des courses 
if (xml.dismoi != null){
//SARAH.speak("Liste des courses : ");

fs.readFile(filePath, function(err, data) { // read file to memory
if (err) throw err;
var objet = JSON.parse(data);
var longueur = objet.courses.length; // le nombre de valeurs dans le fichier courses.json
var jsonStr = JSON.stringify(objet); // transforme l'objet en texte
if ( longueur > 0){
for (var i = 0; i < objet.courses.length ;i++){  // look for the entry with a matching `code` value
console.log(objet.courses[i].item); 
SARAH.speak(objet.courses[i].item+",");
}}
else 
{
SARAH.speak("La liste des courses est vide");
} 
});
callback();
}
// vide la liste des courses
if (xml.vide != null){	
fs.writeFileSync(filePath,'{"courses":[]}',"UTF-8"); // Remet le fichier courses.json a zéro pour une utilisation future
callback({'tts' : "suppression de la liste de course"});
}	
return;
}