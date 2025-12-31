const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (Cloudinary will handle the actual storage)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Configure multer for resume uploads (PDF only)
const resumeUpload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf/;
        const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
        const mimetype = file.mimetype === 'application/pdf';
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

// All routes require authentication
router.use(authMiddleware);

// Upload image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio/images' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Error uploading to Cloudinary' });
                }
                
                res.json({ 
                    success: true, 
                    url: result.secure_url,
                    message: 'File uploaded successfully' 
                });
            }
        );

        // Pipe the file buffer to Cloudinary
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Error uploading file' });
    }
});

// Upload resume to Cloudinary
router.post('/upload-resume', resumeUpload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload PDF to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'portfolio/resumes',
                resource_type: 'raw' // Important for PDFs
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary resume upload error:', error);
                    return res.status(500).json({ success: false, message: 'Error uploading resume to Cloudinary' });
                }
                
                res.json({ 
                    success: true, 
                    url: result.secure_url,
                    message: 'Resume uploaded successfully' 
                });
            }
        );

        // Pipe the file buffer to Cloudinary
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ success: false, message: 'Error uploading resume' });
    }
});

// ==================== PROFILE ROUTES ====================

// Update profile
router.put('/profile', async (req, res) => {
    try {
        const { name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url } = req.body;

        // Check if using Postgres or MySQL
        const isPostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL;

        if (isPostgres) {
            // Postgres: Use INSERT ... ON CONFLICT for upsert
            await db.query(
                `INSERT INTO profile (id, name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    professional_identity = EXCLUDED.professional_identity,
                    bio = EXCLUDED.bio,
                    profile_image_url = EXCLUDED.profile_image_url,
                    resume_url = EXCLUDED.resume_url,
                    email = EXCLUDED.email,
                    github_url = EXCLUDED.github_url,
                    linkedin_url = EXCLUDED.linkedin_url,
                    twitter_url = EXCLUDED.twitter_url`,
                [1, name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
            );
        } else {
            // MySQL: Use UPDATE or INSERT ... ON DUPLICATE KEY
            await db.query(
                `INSERT INTO profile (id, name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    role = VALUES(role),
                    professional_identity = VALUES(professional_identity),
                    bio = VALUES(bio),
                    profile_image_url = VALUES(profile_image_url),
                    resume_url = VALUES(resume_url),
                    email = VALUES(email),
                    github_url = VALUES(github_url),
                    linkedin_url = VALUES(linkedin_url),
                    twitter_url = VALUES(twitter_url)`,
                [name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
            );
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== PROJECT ROUTES ====================

// Create project
router.post('/projects', async (req, res) => {
    try {
        const { title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, tech_stack, display_order } = req.body;

        const isPostgres = process.env.POSTGRES_URL || process.env.DATABASE_URL;

        let projectId;

        if (isPostgres) {
            // Postgres: RETURNING id
            const [result] = await db.query(
                `INSERT INTO projects (title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0]
            );
            projectId = result[0].id;
        } else {
            // MySQL: insertId
            const [result] = await db.query(
                `INSERT INTO projects (title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0]
            );
            projectId = result.insertId;
        }

        // Add tech stack
        if (tech_stack && tech_stack.length > 0) {
            for (let tech of tech_stack) {
                await db.query(
                    'INSERT INTO tech_stack (project_id, technology) VALUES (?, ?)',
                    [projectId, tech]
                );
            }
        }

        res.json({
            success: true,
            message: 'Project created successfully',
            projectId
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update project
router.put('/projects/:id', async (req, res) => {
    try {
        const { title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, tech_stack, display_order } = req.body;
        const projectId = req.params.id;

        await db.query(
            `UPDATE projects SET 
                title = ?, 
                short_description = ?, 
                detailed_description = ?, 
                category = ?,
                image_url = ?,
                github_link = ?, 
                live_link = ?, 
                video_url = ?,
                display_order = ?
            WHERE id = ?`,
            [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0, projectId]
        );

        // Update tech stack - delete old and insert new
        await db.query('DELETE FROM tech_stack WHERE project_id = ?', [projectId]);
        
        if (tech_stack && tech_stack.length > 0) {
            for (let tech of tech_stack) {
                await db.query(
                    'INSERT INTO tech_stack (project_id, technology) VALUES (?, ?)',
                    [projectId, tech]
                );
            }
        }

        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== SKILL ROUTES ====================

// Create skill
router.post('/skills', async (req, res) => {
    try {
        const { name, category, proficiency_level, display_order } = req.body;

        await db.query(
            'INSERT INTO skills (name, category, proficiency_level, display_order) VALUES (?, ?, ?, ?)',
            [name, category, proficiency_level || 0, display_order || 0]
        );

        res.json({
            success: true,
            message: 'Skill added successfully'
        });
    } catch (error) {
        console.error('Create skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update skill
router.put('/skills/:id', async (req, res) => {
    try {
        const { name, category, proficiency_level, display_order } = req.body;

        await db.query(
            'UPDATE skills SET name = ?, category = ?, proficiency_level = ?, display_order = ? WHERE id = ?',
            [name, category, proficiency_level || 0, display_order || 0, req.params.id]
        );

        res.json({
            success: true,
            message: 'Skill updated successfully'
        });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Delete skill
router.delete('/skills/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
