document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector("#compose-form").addEventListener("submit", sendEmail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const element = document.createElement('div');
      if (email.read===true){
        element.style.backgroundColor='grey';
      }
      else{
        element.style.backgroundColor='white';
      }
      element.style.padding="10px";
      element.style.margin="5px";
      element.style.border="1px solid black";
      element.addEventListener('click', ()=>{
        
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
        load_email(email.id);
      });
      element.innerHTML = `From: ${email.sender} Subject: ${email.subject} Time: ${email.timestamp}`;
      document.querySelector('#emails-view').append(element);
     
      
    })
  });

}

function load_email(email_id){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

   

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      document.querySelector('#email-content').innerHTML=`From: ${email.sender} Subject: ${email.subject} Time: ${email.timestamp} Body: ${email.body}`;
      if(email.archived===false){
        document.querySelector('#button-archive').addEventListener('click', ()=>archive_email(email_id));
      }
      else{
        document.querySelector('#button-archive').innerHTML="Unarchive email";
        document.querySelector('#button-archive').addEventListener('click', ()=>unarchive_email(email_id));
      }
      document.querySelector('#button-reply').addEventListener('click', ()=> reply(email));
    })

  
  
  
}



  
function sendEmail() {

  let recipents = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

 
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: recipents,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox('sent')
  }).catch((error) => console.log(error));

}

function archive_email(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  });
  location.reload();
  load_mailbox('inbox');

}

function unarchive_email(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  });
  location.reload();
  load_mailbox('inbox');

}

function reply(email){
  
  compose_email();
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  if(!String(email.subject).startsWith("Re:")){
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }

  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
}