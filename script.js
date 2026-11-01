function showSection(sectionId){
    const sections=document.querySelectorAll("section");

    sections.forEach(function(section){
        sectionId.style.display ="none";
    }
);

document.getElementById(sectionId).style.dispaly = "block";
}