import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize default subjects on startup
async function initializeData() {
  try {
    const subjects = [
      { id: 'design', name: 'Design', description: 'General design tools and resources' },
      { id: 'development', name: 'Development', description: 'Web and software development tools' },
      { id: 'marketing', name: 'Marketing', description: 'Digital marketing and advertising tools' },
      { id: 'video', name: 'Video editing/production', description: 'Video creation and editing tools' },
      { id: 'social', name: 'Social media', description: 'Social media management and content creation' },
      { id: 'gameart', name: 'Game art / 3D modeling', description: '3D modeling and game art creation tools' },
      { id: 'gamedesign', name: 'Game design', description: 'Game development and design tools' },
      { id: 'vr', name: 'VR development', description: 'Virtual reality development tools' },
      { id: 'brand', name: 'Brand design', description: 'Branding and identity design tools' },
      { id: 'content', name: 'Content design', description: 'Content creation and design tools' },
      { id: 'art', name: 'Art design', description: 'Digital art and illustration tools' },
      { id: 'dtp', name: 'Media production (DTP)', description: 'Desktop publishing and media production tools' }
    ];

    const existingSubjects = await kv.get('subjects');
    if (!existingSubjects) {
      await kv.set('subjects', subjects);
      console.log('Initialized default subjects');
    }

    // Initialize some sample AI tools
    const existingTools = await kv.get('ai_tools');
    if (!existingTools) {
      const sampleTools = [
        {
          id: '1',
          subject_id: 'design',
          name: 'Figma AI',
          description: 'AI-powered design assistant integrated into Figma',
          advantages: ['Streamlines design workflow', 'Generates design variations', 'Smart layout suggestions'],
          disadvantages: ['Requires Figma subscription', 'Limited to Figma ecosystem'],
          image_url: ''
        },
        {
          id: '2',
          subject_id: 'development',
          name: 'GitHub Copilot',
          description: 'AI pair programmer that helps write code faster',
          advantages: ['Code completion', 'Supports multiple languages', 'Learns from context'],
          disadvantages: ['Subscription required', 'May generate incorrect code'],
          image_url: ''
        },
        {
          id: '3',
          subject_id: 'marketing',
          name: 'ChatGPT',
          description: 'AI assistant for content creation and marketing copy',
          advantages: ['Versatile content generation', 'Multiple languages', 'Creative writing'],
          disadvantages: ['May lack brand consistency', 'Requires fact-checking'],
          image_url: ''
        }
      ];
      await kv.set('ai_tools', sampleTools);
      console.log('Initialized sample AI tools');
    }
  } catch (error) {
    console.log('Error initializing data:', error);
  }
}

// Initialize data on startup
initializeData();

// Health check endpoint
app.get("/make-server-291b20a9/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all subjects
app.get("/make-server-291b20a9/subjects", async (c) => {
  try {
    const subjects = await kv.get('subjects') || [];
    return c.json({ subjects });
  } catch (error) {
    console.log('Error fetching subjects:', error);
    return c.json({ error: 'Failed to fetch subjects' }, 500);
  }
});

// Get all AI tools
app.get("/make-server-291b20a9/ai-tools", async (c) => {
  try {
    const tools = await kv.get('ai_tools') || [];
    return c.json({ tools });
  } catch (error) {
    console.log('Error fetching AI tools:', error);
    return c.json({ error: 'Failed to fetch AI tools' }, 500);
  }
});

// Get AI tools by subject
app.get("/make-server-291b20a9/ai-tools/:subjectId", async (c) => {
  try {
    const subjectId = c.req.param('subjectId');
    const allTools = await kv.get('ai_tools') || [];
    const tools = allTools.filter(tool => tool.subject_id === subjectId);
    return c.json({ tools });
  } catch (error) {
    console.log('Error fetching AI tools by subject:', error);
    return c.json({ error: 'Failed to fetch AI tools' }, 500);
  }
});

// Create new AI tool
app.post("/make-server-291b20a9/ai-tools", async (c) => {
  try {
    const body = await c.req.json();
    const { subject_id, name, description, advantages, disadvantages, image_url } = body;
    
    if (!subject_id || !name || !description) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const tools = await kv.get('ai_tools') || [];
    const newTool = {
      id: Date.now().toString(),
      subject_id,
      name,
      description,
      advantages: advantages || [],
      disadvantages: disadvantages || [],
      image_url: image_url || ''
    };

    tools.push(newTool);
    await kv.set('ai_tools', tools);
    
    return c.json({ tool: newTool });
  } catch (error) {
    console.log('Error creating AI tool:', error);
    return c.json({ error: 'Failed to create AI tool' }, 500);
  }
});

// Update AI tool
app.put("/make-server-291b20a9/ai-tools/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { subject_id, name, description, advantages, disadvantages, image_url } = body;

    const tools = await kv.get('ai_tools') || [];
    const toolIndex = tools.findIndex(tool => tool.id === id);
    
    if (toolIndex === -1) {
      return c.json({ error: 'Tool not found' }, 404);
    }

    tools[toolIndex] = {
      ...tools[toolIndex],
      subject_id: subject_id || tools[toolIndex].subject_id,
      name: name || tools[toolIndex].name,
      description: description || tools[toolIndex].description,
      advantages: advantages || tools[toolIndex].advantages,
      disadvantages: disadvantages || tools[toolIndex].disadvantages,
      image_url: image_url !== undefined ? image_url : tools[toolIndex].image_url
    };

    await kv.set('ai_tools', tools);
    return c.json({ tool: tools[toolIndex] });
  } catch (error) {
    console.log('Error updating AI tool:', error);
    return c.json({ error: 'Failed to update AI tool' }, 500);
  }
});

// Delete AI tool
app.delete("/make-server-291b20a9/ai-tools/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const tools = await kv.get('ai_tools') || [];
    const filteredTools = tools.filter(tool => tool.id !== id);
    
    if (tools.length === filteredTools.length) {
      return c.json({ error: 'Tool not found' }, 404);
    }

    await kv.set('ai_tools', filteredTools);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting AI tool:', error);
    return c.json({ error: 'Failed to delete AI tool' }, 500);
  }
});

// Search AI tools
app.get("/make-server-291b20a9/search", async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase() || '';
    const tools = await kv.get('ai_tools') || [];
    
    const filteredTools = tools.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.advantages.some(adv => adv.toLowerCase().includes(query)) ||
      tool.disadvantages.some(dis => dis.toLowerCase().includes(query))
    );
    
    return c.json({ tools: filteredTools });
  } catch (error) {
    console.log('Error searching AI tools:', error);
    return c.json({ error: 'Failed to search AI tools' }, 500);
  }
});

// Contact form submission
app.post("/make-server-291b20a9/contact", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, message } = body;
    
    if (!name || !email || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Store contact submissions
    const submissions = await kv.get('contact_submissions') || [];
    const newSubmission = {
      id: Date.now().toString(),
      name,
      email,
      message,
      date: new Date().toISOString()
    };

    submissions.push(newSubmission);
    await kv.set('contact_submissions', submissions);
    
    return c.json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.log('Error submitting contact form:', error);
    return c.json({ error: 'Failed to submit contact form' }, 500);
  }
});

// Get contact submissions (for admin)
app.get("/make-server-291b20a9/contact-submissions", async (c) => {
  try {
    const submissions = await kv.get('contact_submissions') || [];
    return c.json({ submissions });
  } catch (error) {
    console.log('Error fetching contact submissions:', error);
    return c.json({ error: 'Failed to fetch contact submissions' }, 500);
  }
});

// Reviews endpoints
// Get reviews for a specific tool
app.get("/make-server-291b20a9/reviews/:toolId", async (c) => {
  try {
    const toolId = c.req.param('toolId');
    const allReviews = await kv.get('reviews') || [];
    const reviews = allReviews.filter(review => review.tool_id === toolId);
    return c.json({ reviews });
  } catch (error) {
    console.log('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Create new review
app.post("/make-server-291b20a9/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { tool_id, author_name, rating, comment } = body;
    
    if (!tool_id || !rating || !comment) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reviews = await kv.get('reviews') || [];
    const newReview = {
      id: Date.now().toString(),
      tool_id,
      author_name: author_name || 'Anonymous',
      rating: Math.max(1, Math.min(5, parseInt(rating))), // Ensure rating is 1-5
      comment,
      created_at: new Date().toISOString(),
      helpful_count: 0
    };

    reviews.push(newReview);
    await kv.set('reviews', reviews);
    
    return c.json({ review: newReview });
  } catch (error) {
    console.log('Error creating review:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Mark review as helpful
app.post("/make-server-291b20a9/reviews/:reviewId/helpful", async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const reviews = await kv.get('reviews') || [];
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex === -1) {
      return c.json({ error: 'Review not found' }, 404);
    }

    reviews[reviewIndex].helpful_count = (reviews[reviewIndex].helpful_count || 0) + 1;
    await kv.set('reviews', reviews);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error marking review as helpful:', error);
    return c.json({ error: 'Failed to mark review as helpful' }, 500);
  }
});

// File upload endpoints
// Get uploads for a specific tool
app.get("/make-server-291b20a9/uploads/:toolId", async (c) => {
  try {
    const toolId = c.req.param('toolId');
    const allUploads = await kv.get('uploads') || [];
    const uploads = allUploads.filter(upload => upload.tool_id === toolId);
    return c.json({ uploads });
  } catch (error) {
    console.log('Error fetching uploads:', error);
    return c.json({ error: 'Failed to fetch uploads' }, 500);
  }
});

// Create new upload (simplified - in real implementation, this would handle file storage)
app.post("/make-server-291b20a9/uploads", async (c) => {
  try {
    // Note: This is a simplified implementation
    // In production, you would handle actual file upload to Supabase Storage
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const toolId = formData.get('tool_id') as string;
    const authorName = formData.get('author_name') as string;
    
    if (!file || !toolId || !authorName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // For demo purposes, we'll store metadata only
    const uploads = await kv.get('uploads') || [];
    const newUpload = {
      id: Date.now().toString(),
      tool_id: toolId,
      file_name: file.name,
      file_url: `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`, // Placeholder
      file_type: file.type,
      file_size: file.size,
      author_name: authorName,
      created_at: new Date().toISOString()
    };

    uploads.push(newUpload);
    await kv.set('uploads', uploads);
    
    return c.json({ upload: newUpload });
  } catch (error) {
    console.log('Error creating upload:', error);
    return c.json({ error: 'Failed to create upload' }, 500);
  }
});

// Get all reviews (for admin)
app.get("/make-server-291b20a9/reviews", async (c) => {
  try {
    const reviews = await kv.get('reviews') || [];
    return c.json({ reviews });
  } catch (error) {
    console.log('Error fetching all reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Get all uploads (for admin)
app.get("/make-server-291b20a9/uploads", async (c) => {
  try {
    const uploads = await kv.get('uploads') || [];
    return c.json({ uploads });
  } catch (error) {
    console.log('Error fetching all uploads:', error);
    return c.json({ error: 'Failed to fetch uploads' }, 500);
  }
});

Deno.serve(app.fetch);