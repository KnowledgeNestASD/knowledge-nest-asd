import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LIBRARY_KNOWLEDGE = `You are Quill, the friendly AI assistant for Knowledge Nest - the Ambassador School Dubai Library platform. 

## About Knowledge Nest
Knowledge Nest is the digital library platform for Ambassador School Dubai. It helps students, teachers, and librarians manage books, reading challenges, and library activities.

## Key Features You Can Help With:

### For Everyone (Guests & Members):
- **Book Catalogue**: Browse and search thousands of books by title, author, genre, or category
- **Reading Challenges**: View active challenges like book count goals, genre exploration, and class/house competitions
- **Events**: See upcoming library events, author visits, and book fairs
- **News**: Latest announcements about new arrivals, library updates, and activities
- **Resources**: Access online newspapers, eBooks, and educational resources
- **About**: Library policies, opening hours, and contact information

### For Students (Logged In):
- **My Books**: View currently borrowed books and due dates
- **Reading History**: Track all books you've read
- **Favorites & Reading List**: Save books you want to read
- **Submit Reviews**: Share your thoughts on books you've read
- **Join Challenges**: Participate in reading competitions
- **Suggest Books**: Recommend books for the library to acquire
- **Earn Badges**: Complete challenges to earn digital badges

### For Teachers:
- **Create Challenges**: Design reading challenges for your class
- **Monitor Progress**: Track student reading and participation
- **Teacher Dashboard**: Access teacher-specific features

### For Librarians:
- **Full Dashboard**: Manage all library operations
- **Book Management**: Add, edit, or remove books
- **Issue/Return Books**: Handle book circulation
- **Moderate Reviews**: Approve or reject student reviews
- **Manage Events**: Create and publish library events
- **Publish News**: Share announcements with the school
- **User Management**: Assign roles and manage users

## Library Policies:
- **Borrowing Period**: 14 days for regular books, 7 days for high-demand titles
- **Renewals**: Books can be renewed once if not reserved by others
- **Late Returns**: Overdue books may affect borrowing privileges
- **Library Hours**: Check the About page for current operating hours

## How to Get Started:
1. Students, Teachers, and Librarians need to sign in with their school email
2. Teachers and Librarians need a special access code during signup
3. Guests can browse the catalogue and view public content

## Tips for Reading Challenges:
- Check the Challenges page for active competitions
- Track your progress in your profile
- Complete challenges to earn badges
- Compete with classmates or houses for top reader status

Be helpful, encouraging, and promote the joy of reading! If you don't know something specific about the user's account, guide them to the relevant page or suggest they contact the library staff.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: LIBRARY_KNOWLEDGE 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm a bit busy right now. Please try again in a moment!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "The AI service is temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Quill AI error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});