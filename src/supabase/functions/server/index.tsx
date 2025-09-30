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

    // Initialize default admin account
    const existingAdmins = await kv.get('admins');
    if (!existingAdmins) {
      const defaultAdmins = [
        {
          id: '1',
          name: 'GLU Admin',
          email: 'admin@glutools.com',
          password: 'admin123',
          created_at: new Date().toISOString(),
          is_super_admin: true
        }
      ];
      await kv.set('admins', defaultAdmins);
      console.log('Initialized default admin account');
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
          image_url: '',
          link_url: 'https://www.figma.com/'
        },
        {
          id: '2',
          subject_id: 'development',
          name: 'GitHub Copilot',
          description: 'AI pair programmer that helps write code faster',
          advantages: ['Code completion', 'Supports multiple languages', 'Learns from context'],
          disadvantages: ['Subscription required', 'May generate incorrect code'],
          image_url: '',
          link_url: 'https://github.com/features/copilot'
        },
        {
          id: '3',
          subject_id: 'marketing',
          name: 'ChatGPT',
          description: 'AI assistant for content creation and marketing copy',
          advantages: ['Versatile content generation', 'Multiple languages', 'Creative writing'],
          disadvantages: ['May lack brand consistency', 'Requires fact-checking'],
          image_url: '',
          link_url: 'https://chat.openai.com/'
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
    const { subject_id, name, description, advantages, disadvantages, image_url, link_url } = body;
    
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
      image_url: image_url || '',
      link_url: link_url || ''
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
    const { subject_id, name, description, advantages, disadvantages, image_url, link_url } = body;

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
      image_url: image_url !== undefined ? image_url : tools[toolIndex].image_url,
      link_url: link_url !== undefined ? link_url : tools[toolIndex].link_url
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

// Delete review (for admin)
app.delete("/make-server-291b20a9/reviews/:reviewId", async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const reviews = await kv.get('reviews') || [];
    const filteredReviews = reviews.filter(review => review.id !== reviewId);
    
    if (reviews.length === filteredReviews.length) {
      return c.json({ error: 'Review not found' }, 404);
    }

    await kv.set('reviews', filteredReviews);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting review:', error);
    return c.json({ error: 'Failed to delete review' }, 500);
  }
});

// Delete upload (for admin)
app.delete("/make-server-291b20a9/uploads/:uploadId", async (c) => {
  try {
    const uploadId = c.req.param('uploadId');
    const uploads = await kv.get('uploads') || [];
    const filteredUploads = uploads.filter(upload => upload.id !== uploadId);
    
    if (uploads.length === filteredUploads.length) {
      return c.json({ error: 'Upload not found' }, 404);
    }

    await kv.set('uploads', filteredUploads);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting upload:', error);
    return c.json({ error: 'Failed to delete upload' }, 500);
  }
});

// Admin management endpoints
// Login endpoint
app.post("/make-server-291b20a9/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const admins = await kv.get('admins') || [];
    const admin = admins.find(a => a.email === email && a.password === password);
    
    if (!admin) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Don't return password in response
    const { password: _, ...adminData } = admin;
    return c.json({ success: true, admin: adminData });
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get all admins
app.get("/make-server-291b20a9/admins", async (c) => {
  try {
    const admins = await kv.get('admins') || [];
    // Remove passwords from response
    const safeAdmins = admins.map(({ password, ...admin }) => admin);
    return c.json({ admins: safeAdmins });
  } catch (error) {
    console.log('Error fetching admins:', error);
    return c.json({ error: 'Failed to fetch admins' }, 500);
  }
});

// Create new admin
app.post("/make-server-291b20a9/admins", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }

    const admins = await kv.get('admins') || [];
    
    // Check if email already exists
    if (admins.some(admin => admin.email === email)) {
      return c.json({ error: 'Admin with this email already exists' }, 400);
    }

    const newAdmin = {
      id: Date.now().toString(),
      name,
      email,
      password,
      created_at: new Date().toISOString(),
      is_super_admin: false
    };

    admins.push(newAdmin);
    await kv.set('admins', admins);
    
    // Don't return password in response
    const { password: _, ...adminData } = newAdmin;
    return c.json({ admin: adminData });
  } catch (error) {
    console.log('Error creating admin:', error);
    return c.json({ error: 'Failed to create admin' }, 500);
  }
});

// Update admin
app.put("/make-server-291b20a9/admins/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, email, password } = body;

    const admins = await kv.get('admins') || [];
    const adminIndex = admins.findIndex(admin => admin.id === id);
    
    if (adminIndex === -1) {
      return c.json({ error: 'Admin not found' }, 404);
    }

    // Check if email is being changed and already exists
    if (email && email !== admins[adminIndex].email) {
      if (admins.some(admin => admin.email === email && admin.id !== id)) {
        return c.json({ error: 'Admin with this email already exists' }, 400);
      }
    }

    // Update admin data
    admins[adminIndex] = {
      ...admins[adminIndex],
      name: name || admins[adminIndex].name,
      email: email || admins[adminIndex].email,
      password: password || admins[adminIndex].password,
    };

    await kv.set('admins', admins);
    
    // Don't return password in response
    const { password: _, ...adminData } = admins[adminIndex];
    return c.json({ admin: adminData });
  } catch (error) {
    console.log('Error updating admin:', error);
    return c.json({ error: 'Failed to update admin' }, 500);
  }
});

// Delete admin
app.delete("/make-server-291b20a9/admins/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const admins = await kv.get('admins') || [];
    
    const adminToDelete = admins.find(admin => admin.id === id);
    if (!adminToDelete) {
      return c.json({ error: 'Admin not found' }, 404);
    }

    // Prevent deletion of super admin
    if (adminToDelete.is_super_admin) {
      return c.json({ error: 'Cannot delete super admin account' }, 403);
    }

    const filteredAdmins = admins.filter(admin => admin.id !== id);
    
    // Ensure at least one admin remains
    if (filteredAdmins.length === 0) {
      return c.json({ error: 'Cannot delete the last admin account' }, 403);
    }

    await kv.set('admins', filteredAdmins);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting admin:', error);
    return c.json({ error: 'Failed to delete admin' }, 500);
  }
});

// Bulk import AI tools
app.post("/make-server-291b20a9/bulk-import-tools", async (c) => {
  try {
    const newTools = [
      // Design/Development
      {
        id: 'adobe-firefly',
        subject_id: 'design',
        name: 'Adobe Firefly',
        description: 'AI-powered creative tools integrated directly into Adobe Creative Suite',
        advantages: [
          'Werkt direct in Photoshop/Illustrator',
          'Goede generative fill functionaliteit',
          'Commercieel bruikbaar met veilige datasets',
          'Professionele integratie'
        ],
        disadvantages: [
          'Soms voorspelbare resultaten',
          'Beperkt in zeer unieke stijlen',
          'Hoge licentiekosten Adobe Suite'
        ],
        image_url: 'https://images.unsplash.com/photo-1740174459730-33a1983b51af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG9iZSUyMGZpcmVmbHklMjBBSSUyMGRlc2lnbnxlbnwxfHx8fDE3NTkyMTU2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        link_url: 'https://firefly.adobe.com/'
      },
      {
        id: 'figma-ai-tools',
        subject_id: 'design',
        name: 'Figma AI',
        description: 'AI-powered design features within Figma for faster prototyping and design workflows',
        advantages: [
          'Versnelt prototyping workflow',
          'Automatische layout suggesties',
          'Copy en content suggesties',
          'Makkelijk te integreren in bestaande workflow'
        ],
        disadvantages: [
          'Outputs zijn vaak generiek',
          'Nog in ontwikkeling (niet alles stabiel)',
          'Beperkt tot Figma ecosystem'
        ],
        image_url: 'https://images.unsplash.com/photo-1653647054667-c99dc7f914ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWdtYSUyMGRlc2lnbiUyMHRvb2x8ZW58MXx8fHwxNzU5MTcxODY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        link_url: 'https://www.figma.com/'
      },
      {
        id: 'looka-brand',
        subject_id: 'design',
        name: 'Looka',
        description: 'AI-powered logo and brand identity generator for quick professional branding',
        advantages: [
          'Snelle logo generatie',
          'Complete branding kits in minuten',
          'Betaalbaar voor startups',
          'Gebruiksvriendelijke interface'
        ],
        disadvantages: [
          'Logo\'s kunnen standaard aanvoelen',
          'Minder geschikt voor high-end branding',
          'Beperkte customization opties'
        ],
        image_url: 'https://images.unsplash.com/photo-1670341445620-cc35bf57fe56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwYnJhbmRpbmd8ZW58MXx8fHwxNzU5MTQwNTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Marketing
      {
        id: 'canva-ai-marketing',
        subject_id: 'marketing',
        name: 'Canva AI',
        description: 'AI-powered design and content creation platform for marketing materials',
        advantages: [
          'Supersnel visuals en teksten maken',
          'Enorme template bibliotheek',
          'Makkelijk te gebruiken interface',
          'Ingebouwde stock foto\'s en elementen'
        ],
        disadvantages: [
          'Generieke look die herkenbaar is',
          'Minder geschikt voor unieke campagnes',
          'Beperkte customization voor professioneel werk'
        ],
        image_url: 'https://images.unsplash.com/photo-1649091245823-18be815da4f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW52YSUyMGRlc2lnbiUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NTkyMTU2MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'chatgpt-marketing',
        subject_id: 'marketing',
        name: 'ChatGPT',
        description: 'AI assistant for marketing copy, campaign ideas, and content creation',
        advantages: [
          'Sterke tekstgenerator voor alle content types',
          'Ideeën voor campagnes en strategieën',
          'Script writing en SEO content',
          'Ondersteunt multiple talen'
        ],
        disadvantages: [
          'Kan oppervlakkig zijn zonder context',
          'Mist diep inzicht in merkstrategie',
          'Vereist fact-checking en editing'
        ],
        image_url: 'https://images.unsplash.com/photo-1751448582395-27fc57293f1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGNoYXRib3QlMjBjb252ZXJzYXRpb258ZW58MXx8fHwxNzU5MjE1NjM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'google-ads-ai',
        subject_id: 'marketing',
        name: 'Google Ads AI features',
        description: 'AI-powered advertising optimization and targeting within Google Ads platform',
        advantages: [
          'Automatische campagne optimalisatie',
          'Geavanceerde targeting mogelijkheden',
          'Data-gedreven beslissingen',
          'Real-time bidding optimization'
        ],
        disadvantages: [
          'Afhankelijk van Google\'s algoritme',
          'Weinig transparantie in beslissingen',
          'Vereist groot budget voor beste resultaten'
        ],
        image_url: 'https://images.unsplash.com/photo-1631270315847-f418bde47ca6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBhZHMlMjBhZHZlcnRpc2luZ3xlbnwxfHx8fDE3NTkyMTU2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Video Editing/Production
      {
        id: 'descript-video',
        subject_id: 'video',
        name: 'Descript',
        description: 'AI-powered video editing through text manipulation and voice cloning',
        advantages: [
          'Video bewerken via tekst editing',
          'Automatisch stiltes verwijderen',
          'AI voice cloning functionaliteit',
          'Perfecte tool voor podcasts en tutorials'
        ],
        disadvantages: [
          'Niet geschikt voor filmische edits',
          'Beperkt voor creatieve video producties',
          'Werkt vooral goed voor talking head content'
        ],
        image_url: 'https://images.unsplash.com/photo-1732327390234-c78eb47d1b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmclMjBwcm9kdWN0aW9ufGVufDF8fHx8MTc1OTIwOTY5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'capcut-video',
        subject_id: 'video',
        name: 'CapCut',
        description: 'Free AI-powered mobile video editing app perfect for social media content',
        advantages: [
          'Gratis te gebruiken',
          'Snelle AI-effecten en filters',
          'Automatische ondertiteling',
          'Ideaal voor TikTok en Instagram content'
        ],
        disadvantages: [
          'Minder professioneel voor high-end video',
          'Soms watermerken op exports',
          'Beperkte advanced editing features'
        ],
        image_url: 'https://images.unsplash.com/photo-1659353672237-91826f496791?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjB2aWRlbyUyMGVkaXRpbmclMjBhcHB8ZW58MXx8fHwxNzU5MjE1NjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'wisecut-video',
        subject_id: 'video',
        name: 'Wisecut',
        description: 'AI video editor that automatically cuts silences and optimizes pacing',
        advantages: [
          'Knipt automatisch stiltes en pauzes',
          'Maakt snelle social media edits',
          'Tijdbesparend voor content creators',
          'Automatische muziek synchronisatie'
        ],
        disadvantages: [
          'Beperkt qua creatieve vrijheid',
          'Niet ideaal voor lange producties',
          'Minder controle over final cut'
        ],
        image_url: 'https://images.unsplash.com/photo-1732327390234-c78eb47d1b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmclMjBwcm9kdWN0aW9ufGVufDF8fHx8MTc1OTIwOTY5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'flexclip-video',
        subject_id: 'video',
        name: 'FlexClip',
        description: 'AI-powered text-to-video creation platform for quick video production',
        advantages: [
          'Tekst-naar-video conversie',
          'Eenvoudig in gebruik',
          'Grote template bibliotheek',
          'Goede stock video integratie'
        ],
        disadvantages: [
          'Outputs zijn vaak standaard',
          'Minder filmische kwaliteit',
          'Beperkte customization opties'
        ],
        image_url: 'https://images.unsplash.com/photo-1732327390234-c78eb47d1b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmclMjBwcm9kdWN0aW9ufGVufDF8fHx8MTc1OTIwOTY5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Game Art / 3D Modeling
      {
        id: 'layer-ai-gameart',
        subject_id: 'gameart',
        name: 'Layer.ai',
        description: 'AI-powered 2D game asset generation with style training capabilities',
        advantages: [
          'Snel 2D game assets genereren',
          'Trainbaar op eigen art style',
          'Consistente character designs',
          'Goede integratie workflows'
        ],
        disadvantages: [
          'Outputs niet direct klaar voor game engines',
          'Vereist nabewerking voor implementatie',
          'Beperkt tot 2D assets'
        ],
        image_url: 'https://images.unsplash.com/photo-1596088359637-8d614753fb28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMG1vZGVsaW5nJTIwZ2FtZSUyMGFydHxlbnwxfHx8fDE3NTkyMTU2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'inworld-ai-npc',
        subject_id: 'gameart',
        name: 'InWorld AI (NPCs)',
        description: 'AI-powered NPC dialogue and behavior system for immersive game characters',
        advantages: [
          'Levensechte NPC dialogen en gedrag',
          'Plug-and-play integratie',
          'Dynamische conversaties',
          'Emotioneel intelligente characters'
        ],
        disadvantages: [
          'Performance-zwaar voor real-time gebruik',
          'Moeilijk te finetunen voor unieke game werelden',
          'Hoge kosten voor uitgebreide implementatie'
        ],
        image_url: 'https://images.unsplash.com/photo-1673350808686-209dc177c898?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGdhbWUlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NTkyMTU2NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'stable-diffusion-concept',
        subject_id: 'gameart',
        name: 'Stable Diffusion / Midjourney (Concept Art)',
        description: 'AI image generators for rapid game concept art and visual development',
        advantages: [
          'Razendsnel concept art maken',
          'Enorme stijlvariatie mogelijk',
          'Goede inspiratie tool',
          'Open-source opties beschikbaar'
        ],
        disadvantages: [
          'Inconsistente resultaten tussen prompts',
          'Nabewerking nodig voor game bruikbaarheid',
          'Moeilijk voor character consistency'
        ],
        image_url: 'https://images.unsplash.com/photo-1754229164665-9ea0d5579063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRqb3VybmV5JTIwQUklMjBhcnR8ZW58MXx8fHwxNzU5MjE1NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Social Media
      {
        id: 'canva-ai-social',
        subject_id: 'social',
        name: 'Canva AI',
        description: 'AI-powered social media content creation with automated scheduling',
        advantages: [
          'Makkelijk social media posts maken',
          'AI-generated captions en hashtags',
          'Scheduling integratie met platforms',
          'Template optimalisatie per platform'
        ],
        disadvantages: [
          'Outputs kunnen te "template-achtig" worden',
          'Beperkte brand customization',
          'Herkenbare Canva stijl'
        ],
        image_url: 'https://images.unsplash.com/photo-1572814392266-1620040c58be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnQlMjBjcmVhdGlvbnxlbnwxfHx8fDE3NTkxOTE3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'capcut-social',
        subject_id: 'social',
        name: 'CapCut',
        description: 'Perfect AI video editor for creating engaging social media reels and shorts',
        advantages: [
          'Perfecte tool voor snelle reels en shorts',
          'Veel AI effecten en transitions',
          'Trending templates en sounds',
          'Automatische format optimalisatie'
        ],
        disadvantages: [
          'Standaard filters kunnen goedkoop lijken',
          'Beperkte professionele editing features',
          'Afhankelijk van trending effects'
        ],
        image_url: 'https://images.unsplash.com/photo-1659353672237-91826f496791?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjB2aWRlbyUyMGVkaXRpbmclMjBhcHB8ZW58MXx8fHwxNzU5MjE1NjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'buffer-hootsuite-ai',
        subject_id: 'social',
        name: 'Buffer/Hootsuite (met AI)',
        description: 'AI-enhanced social media management platforms with smart scheduling',
        advantages: [
          'AI optimaliseert posting timing',
          'Geïntegreerde contentkalender',
          'Analytics en performance insights',
          'Multi-platform management'
        ],
        disadvantages: [
          'Premium abonnementen zijn duur',
          'Afhankelijk van AI-suggesties',
          'Leercurve voor geavanceerde features'
        ],
        image_url: 'https://images.unsplash.com/photo-1572814392266-1620040c58be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NpYWwlMjBtZWRpYSUyMGNvbnRlbnQlMjBjcmVhdGlvbnxlbnwxfHx8fDE3NTkxOTE3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Game Design
      {
        id: 'unity-ml-agents',
        subject_id: 'gamedesign',
        name: 'Unity ML-Agents',
        description: 'Machine learning framework for training intelligent AI agents in Unity games',
        advantages: [
          'AI-tegenstanders trainen en simuleren',
          'Complexe simulaties kunnen draaien',
          'Integratie met Unity workflow',
          'Open-source en gratis'
        ],
        disadvantages: [
          'Vraagt veel technische ML kennis',
          'Steile leercurve voor beginners',
          'Vereist krachtige hardware voor training'
        ],
        image_url: 'https://images.unsplash.com/photo-1665142726875-f931a29dcee3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml0eSUyMGdhbWUlMjBlbmdpbmV8ZW58MXx8fHwxNzU5MjE1NjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'ai-prototyping-tools',
        subject_id: 'gamedesign',
        name: 'AI Prototyping Tools (ChatGPT voor ideeën)',
        description: 'AI assistants for generating game mechanics, storylines, and design concepts',
        advantages: [
          'Inspiratie voor game mechanics en features',
          'Snelle level design ideeën',
          'Storyline en character development',
          'Brainstorming partner'
        ],
        disadvantages: [
          'Vaak oppervlakkige suggesties',
          'Weinig begrip voor "fun factor"',
          'Vereist game design expertise voor filtering'
        ],
        image_url: 'https://images.unsplash.com/photo-1673350808686-209dc177c898?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGdhbWUlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NTkyMTU2NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // VR Development
      {
        id: 'nvidia-audio2face',
        subject_id: 'vr',
        name: 'Nvidia Audio2Face',
        description: 'AI-powered facial animation system that creates realistic expressions from audio',
        advantages: [
          'Realistische gezichtsanimatie vanuit voice input',
          'Tijdbesparend voor character animation',
          'Hoge kwaliteit output',
          'Goede integratie met 3D pipelines'
        ],
        disadvantages: [
          'Veel GPU-kracht en VRAM nodig',
          'Outputs niet altijd emotioneel subtiel',
          'Dure hardware requirements'
        ],
        image_url: 'https://images.unsplash.com/photo-1592383010275-b028451b2947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWUiUyMHZpcnR1YWwlMjByZWFsaXR5JTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzU5MjE1NjY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'ai-scene-generation',
        subject_id: 'vr',
        name: 'AI Scene Generation',
        description: 'AI tools for generating 3D environments and scenes for VR applications',
        advantages: [
          'Sneller VR omgevingen maken',
          'Variatie in scene generation',
          'Inspiratie voor environment design',
          'Prototype snelheid verhogen'
        ],
        disadvantages: [
          '3D modellen vaak zwaar voor VR',
          'Niet direct VR-ready output',
          'Optimalisatie vereist voor performance'
        ],
        image_url: 'https://images.unsplash.com/photo-1592383010275-b028451b2947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxWUiUyMHZpcnR1YWwlMjByZWFsaXR5JTIwZGV2ZWxvcG1lbnR8ZW58MXx8fHwxNzU5MjE1NjY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Brand Design
      {
        id: 'looka-brand-design',
        subject_id: 'brand',
        name: 'Looka',
        description: 'Comprehensive AI-powered brand identity generator with logo and style guides',
        advantages: [
          'Alles-in-één brand kit (logo, kleuren, fonts)',
          'Snelle brand identity ontwikkeling',
          'Professionele templates',
          'Betaalbaar voor kleine bedrijven'
        ],
        disadvantages: [
          'Vaak niet uniek genoeg',
          'Minder geschikt voor premium merken',
          'Template-gebaseerde benadering'
        ],
        image_url: 'https://images.unsplash.com/photo-1670341445620-cc35bf57fe56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwYnJhbmRpbmd8ZW58MXx8fHwxNzU5MTQwNTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'brandmark-io',
        subject_id: 'brand',
        name: 'Brandmark.io',
        description: 'AI logo generator focused on creating simple, clean brand identities',
        advantages: [
          'Simpele, schone logo designs',
          'Snelle brand identiteit creatie',
          'Goede typografie integratie',
          'Vector outputs'
        ],
        disadvantages: [
          'Outputs vaak te standaard',
          'Niet onderscheidend genoeg',
          'Beperkte customization na generatie'
        ],
        image_url: 'https://images.unsplash.com/photo-1670341445620-cc35bf57fe56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwYnJhbmRpbmd8ZW58MXx8fHwxNzU5MTQwNTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'coolors-fontjoy',
        subject_id: 'brand',
        name: 'Coolors / Fontjoy (AI paletten & typografie)',
        description: 'AI-powered color palette and font pairing generators for brand design',
        advantages: [
          'Snelle kleur combinaties genereren',
          'Handig bij designer\'s block',
          'Goede font pairing suggesties',
          'Gratis basis functionaliteiten'
        ],
        disadvantages: [
          'Mist merkcontext en strategy',
          'Kan brand mismatch veroorzaken',
          'Oppervlakkige kleur psychologie'
        ],
        image_url: 'https://images.unsplash.com/photo-1650402268468-7526b2502a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvciUyMHBhbGV0dGUlMjBkZXNpZ258ZW58MXx8fHwxNzU5MTQ0NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Content Design
      {
        id: 'designs-ai',
        subject_id: 'content',
        name: 'Designs.ai',
        description: 'All-in-one AI platform for creating banners, videos, and social media content',
        advantages: [
          'All-in-one tool voor verschillende content types',
          'Snelle banner en video creatie',
          'Geïntegreerde social media templates',
          'Consistent design systeem'
        ],
        disadvantages: [
          'Outputs vaak generiek en herkenbaar',
          'Weinig creatieve vrijheid',
          'Template-afhankelijke workflow'
        ],
        image_url: 'https://images.unsplash.com/photo-1649091245823-18be815da4f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW52YSUyMGRlc2lnbiUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NTkyMTU2MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'canva-ai-content',
        subject_id: 'content',
        name: 'Canva AI',
        description: 'AI-enhanced content creation with smart templates and automated design suggestions',
        advantages: [
          'Snel content maken met AI assistentie',
          'Geïntegreerd met stock photos en graphics',
          'Template intelligentie',
          'Multi-format export mogelijkheden'
        ],
        disadvantages: [
          'Vaak "één stijl" herkenbaar',
          'Minder uniek dan custom design',
          'Template beperkingen'
        ],
        image_url: 'https://images.unsplash.com/photo-1649091245823-18be815da4f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW52YSUyMGRlc2lnbiUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NTkyMTU2MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Art Design
      {
        id: 'midjourney-art',
        subject_id: 'art',
        name: 'Midjourney',
        description: 'Leading AI art generator known for highly creative and artistic image generation',
        advantages: [
          'Extreem creatieve en artistieke beelden',
          'Snel en inspirerend',
          'Artistiek zeer sterk',
          'Actieve community en updates'
        ],
        disadvantages: [
          'Werkt via Discord (niet gebruiksvriendelijk)',
          'Lastig voor beginners',
          'Niet 100% commercieel veilig',
          'Subscription vereist'
        ],
        image_url: 'https://images.unsplash.com/photo-1754229164665-9ea0d5579063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRqb3VybmV5JTIwQUklMjBhcnR8ZW58MXx8fHwxNzU5MjE1NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'stable-diffusion-art',
        subject_id: 'art',
        name: 'Stable Diffusion',
        description: 'Open-source AI art generator with extensive customization and model options',
        advantages: [
          'Open-source en gratis te gebruiken',
          'Veel custom modellen beschikbaar',
          'Oneindig aanpasbaar',
          'Lokaal te draaien (privacy)'
        ],
        disadvantages: [
          'Technische installatie vereist',
          'Kwaliteit varieert per model',
          'Steile leercurve voor beginners'
        ],
        image_url: 'https://images.unsplash.com/photo-1754229164665-9ea0d5579063?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFibGUlMjBkaWZmdXNpb24lMjBBSSUyMGFydHxlbnwxfHx8fDE3NTkyMTU2NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'adobe-firefly-art',
        subject_id: 'art',
        name: 'Adobe Firefly (art)',
        description: 'Adobe\'s AI art generator with commercial-safe datasets and Creative Suite integration',
        advantages: [
          'Veilige datasets voor commercieel gebruik',
          'Professionele integratie met Adobe tools',
          'Commercieel bruikbaar zonder zorgen',
          'Consistent en betrouwbaar'
        ],
        disadvantages: [
          'Stijlen beperkter dan Midjourney',
          'Minder artistieke vrijheid',
          'Adobe subscription vereist'
        ],
        image_url: 'https://images.unsplash.com/photo-1740174459730-33a1983b51af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG9iZSUyMGZpcmVmbHklMjBBSSUyMGRlc2lnbnxlbnwxfHx8fDE3NTkyMTU2MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      
      // Media Production (DTP)
      {
        id: 'adobe-indesign-ai',
        subject_id: 'dtp',
        name: 'Adobe InDesign + AI plugins',
        description: 'Professional desktop publishing with AI-powered layout and content suggestions',
        advantages: [
          'Professionele DTP mogelijkheden',
          'AI helpt met layout automatisering',
          'Geavanceerde typografie controle',
          'Print-ready output kwaliteit'
        ],
        disadvantages: [
          'Hoge licentiekosten',
          'Steile leercurve voor beginners',
          'Overkill voor simpele projecten'
        ],
        image_url: 'https://images.unsplash.com/photo-1688582139492-734f3d3746d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEVFAlMjBkZXNrdG9wJTIwcHVibGlzaGluZ3xlbnwxfHx8fDE3NTkyMTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'canva-dtp',
        subject_id: 'dtp',
        name: 'Canva (DTP)',
        description: 'User-friendly design platform for creating print materials and publications',
        advantages: [
          'Eenvoudig te gebruiken interface',
          'Snelle flyers en brochures maken',
          'Template bibliotheek voor print',
          'Betaalbaar alternatief'
        ],
        disadvantages: [
          'Niet geschikt voor geavanceerd drukwerk',
          'Beperkte resolutie en kleurprofielen',
          'Minder professionele print output'
        ],
        image_url: 'https://images.unsplash.com/photo-1688582139492-734f3d3746d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEVFAlMjBkZXNrdG9wJTIwcHVibGlzaGluZ3xlbnwxfHx8fDE3NTkyMTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      }
    ];

    // Get existing tools to avoid duplicates
    const existingTools = await kv.get('ai_tools') || [];
    
    // Filter out tools that already exist (by id)
    const existingIds = existingTools.map(tool => tool.id);
    const toolsToAdd = newTools.filter(tool => !existingIds.includes(tool.id));
    
    if (toolsToAdd.length === 0) {
      return c.json({ message: 'All tools already exist in database', added: 0 });
    }

    // Add new tools to existing ones
    const updatedTools = [...existingTools, ...toolsToAdd];
    await kv.set('ai_tools', updatedTools);
    
    return c.json({ 
      success: true, 
      message: `Successfully added ${toolsToAdd.length} new AI tools`,
      added: toolsToAdd.length,
      total: updatedTools.length
    });
  } catch (error) {
    console.log('Error bulk importing tools:', error);
    return c.json({ error: 'Failed to bulk import tools' }, 500);
  }
});

Deno.serve(app.fetch);