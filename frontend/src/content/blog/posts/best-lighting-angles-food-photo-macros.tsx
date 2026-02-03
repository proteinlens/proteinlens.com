/**
 * Blog Post: Best Lighting and Angles for Food Photo Macro Estimates
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function BestLightingAngles() {
  return (
    <div className="blog-content">
      <p>
        The quality of your food photo directly affects how accurately AI can estimate your macros. 
        Good lighting and angles can improve accuracy by 10-20%. Here's how to get it right.
      </p>

      <h2>Why Photo Quality Matters</h2>

      <p>
        AI food recognition works by identifying:
      </p>

      <ul>
        <li>What foods are present</li>
        <li>The relative size of each food</li>
        <li>Visual cues about preparation (grilled vs fried, sauced vs dry)</li>
      </ul>

      <p>
        When photos are dark, blurry, or at odd angles, the AI has less information to work with — 
        leading to less accurate estimates.
      </p>

      <h2>Best Lighting for Food Photos</h2>

      <h3>✅ Natural daylight (best)</h3>
      <p>
        Soft, diffused natural light from a window is ideal. It evenly illuminates your food 
        without harsh shadows, making it easy for AI to identify everything on the plate.
      </p>

      <h3>✅ Bright indoor lighting</h3>
      <p>
        If natural light isn't available, turn on overhead lights plus any nearby lamps. 
        More light is better than less.
      </p>

      <h3>⚠️ Restaurant lighting</h3>
      <p>
        Many restaurants have dim, warm lighting that makes photos orange or dark. 
        If possible, position your plate near a window or use your phone's night mode.
      </p>

      <h3>❌ Avoid backlighting</h3>
      <p>
        Don't photograph food with a window or light source behind it. This creates silhouettes 
        where the food is dark and unreadable.
      </p>

      <h2>Best Angles for Macro Accuracy</h2>

      <h3>Overhead (top-down) — Best for plates</h3>
      <p>
        Shooting directly from above shows everything on the plate equally. This is the most 
        reliable angle for portion estimation because:
      </p>
      <ul>
        <li>All foods are equally visible</li>
        <li>Plate size provides scale reference</li>
        <li>No foods are hidden behind others</li>
      </ul>

      <h3>45-degree angle — Good for bowls</h3>
      <p>
        For bowls, soups, or stacked foods, a 45-degree angle shows depth while still capturing 
        most of the contents. This works well for:
      </p>
      <ul>
        <li>Salads and grain bowls</li>
        <li>Soups and stews</li>
        <li>Layered foods (burrito bowls, parfaits)</li>
      </ul>

      <h3>❌ Avoid extreme side angles</h3>
      <p>
        Low side angles make portions look larger or smaller than they are and hide foods 
        behind other foods. Skip the "Instagram aesthetic" angle for tracking purposes.
      </p>

      <h2>Composition Tips</h2>

      <h3>1. Capture the entire plate</h3>
      <p>
        Make sure all food is visible in the frame. Cutting off edges means the AI can't 
        see (and can't count) those calories.
      </p>

      <h3>2. Include reference objects</h3>
      <p>
        A standard dinner plate (10-11 inches), fork, or your hand in frame gives the AI 
        scale to estimate portions more accurately.
      </p>

      <h3>3. Separate foods when possible</h3>
      <p>
        If you're plating your own food, keep items slightly separated rather than piled. 
        This helps the AI identify and measure each component.
      </p>

      <h3>4. Photograph before eating</h3>
      <p>
        A full, undisturbed plate gives much better results than a half-eaten meal. Make it 
        a habit to snap before your first bite.
      </p>

      <h2>Quick Reference Checklist</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Before snapping your food photo:</p>
        <ul className="space-y-1">
          <li>☀️ Good lighting (natural daylight or bright indoor)</li>
          <li>📐 Overhead or 45-degree angle</li>
          <li>🍽️ Entire plate visible in frame</li>
          <li>🍴 Reference object included (plate, fork, hand)</li>
          <li>🔳 Foods separated, not piled</li>
          <li>📸 Photo taken before eating</li>
        </ul>
      </div>

      <h2>What If Conditions Aren't Ideal?</h2>

      <p>
        Sometimes you're in a dark restaurant or just want to eat without fussing over photos. 
        That's fine! AI tracking is still useful even with imperfect photos.
      </p>

      <p>
        Most apps (including <Link to="/" className="text-primary hover:underline">ProteinLens</Link>) 
        let you adjust estimates after scanning. Take the best photo you can, then tweak the 
        results if you know they're off.
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Remember:</p>
        <p>
          An 80% accurate estimate you actually log beats a 95% accurate estimate you skip 
          because it was too much hassle. Don't let perfect be the enemy of good.
        </p>
      </div>
    </div>
  );
}
