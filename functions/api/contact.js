export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const {
      name,
      email,
      phone,
      service,
      message
    } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Intralink Website <website@interlinktechnologies.co.uk>",
        to: ["info@intralinktechnologies.co.uk"],
        subject: `New Website Enquiry - ${service}`,
        reply_to: email,
        html: `
          <h2>New Website Enquiry</h2>

          <p><strong>Name:</strong> ${name}</p>

          <p><strong>Email:</strong> ${email}</p>

          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>

          <p><strong>Service:</strong> ${service}</p>

          <hr>

          <p>${message.replace(/\n/g,"<br>")}</p>
        `
      })
    });

    if (!response.ok) {

      const error = await response.text();

      return new Response(error,{
        status:500
      });

    }

    return new Response(
      JSON.stringify({
        success:true
      }),
      {
        headers:{
          "Content-Type":"application/json"
        }
      }
    );

  } catch(err){

    return new Response(
      JSON.stringify({
        success:false,
        error:err.message
      }),
      {
        status:500,
        headers:{
          "Content-Type":"application/json"
        }
      }
    );

  }
}
