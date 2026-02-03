/**
 * Blog Post: Photo Macro Tracking vs Barcode Scanning
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function PhotoMacroTrackingVsBarcodeScanning() {
  return (
    <div className="blog-content">
      <p>
        Two methods dominate macro tracking apps today: barcode scanning and AI photo analysis. 
        Both promise to make logging faster, but they work very differently — and each has 
        situations where it shines.
      </p>

      <p>Let's break down when to use each method.</p>

      <h2>How Each Method Works</h2>

      <h3>Barcode Scanning</h3>
      <p>
        You scan a product's barcode, and the app looks up pre-entered nutrition data from a database. 
        Simple, fast, and accurate — as long as the product is in the database.
      </p>

      <h3>Photo Macro Tracking</h3>
      <p>
        AI analyzes an image of your food, identifies what's on the plate, estimates portions, 
        and calculates macros. Works for any food, but relies on visual estimation.
      </p>

      <h2>Speed Comparison</h2>

      <div className="bg-muted/50 rounded-lg p-4 my-6">
        <ul className="space-y-2">
          <li><strong>Barcode scanning:</strong> 3-5 seconds (if product is in database)</li>
          <li><strong>Photo tracking:</strong> 5-15 seconds (any food)</li>
          <li><strong>Barcode + manual search:</strong> 30 seconds to 2+ minutes (if not in database)</li>
        </ul>
      </div>

      <p>
        <strong>Winner:</strong> Barcode is faster for packaged foods. Photo is faster for 
        anything that doesn't have a barcode (which is most of what we eat).
      </p>

      <h2>Accuracy Comparison</h2>

      <table className="w-full border-collapse my-6">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">Food Type</th>
            <th className="text-left p-2">Barcode</th>
            <th className="text-left p-2">Photo AI</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="p-2">Packaged snacks</td>
            <td className="p-2 text-primary">Exact (from label)</td>
            <td className="p-2">±10-15%</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">Meal kit ingredients</td>
            <td className="p-2 text-primary">Exact</td>
            <td className="p-2">±15%</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">Restaurant meals</td>
            <td className="p-2">N/A (no barcode)</td>
            <td className="p-2 text-primary">±15-25%</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">Home-cooked meals</td>
            <td className="p-2">Requires logging each ingredient</td>
            <td className="p-2 text-primary">±15-20% (one photo)</td>
          </tr>
          <tr className="border-b border-border">
            <td className="p-2">Fresh produce/meat</td>
            <td className="p-2">Often missing from database</td>
            <td className="p-2 text-primary">±10-15%</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Winner:</strong> Barcode wins for packaged foods. Photo wins for everything else.
      </p>

      <h2>Real-World Use Cases</h2>

      <h3>When Barcode Scanning Wins</h3>
      <ul>
        <li>Tracking packaged snacks (protein bars, chips, yogurt cups)</li>
        <li>Meal prep with consistent branded ingredients</li>
        <li>Pre-packaged meals (frozen dinners, meal kits)</li>
        <li>When you need exact nutrition for medical reasons</li>
      </ul>

      <h3>When Photo Tracking Wins</h3>
      <ul>
        <li>Restaurant meals and takeout</li>
        <li>Home-cooked meals with multiple ingredients</li>
        <li>Fresh foods without packaging (produce, deli meat, bakery items)</li>
        <li>Social eating where you can't scan each component</li>
        <li>International foods not in Western databases</li>
        <li>When speed and sustainability matter more than perfection</li>
      </ul>

      <h2>The Hybrid Approach</h2>

      <p>
        The best trackers use both methods strategically:
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
        <p className="font-semibold mb-2">Smart tracking strategy:</p>
        <ul className="space-y-1">
          <li>📦 <strong>Barcode scan</strong> packaged foods at home (protein bars, yogurt, etc.)</li>
          <li>📸 <strong>Photo scan</strong> restaurant meals and home-cooked dinners</li>
          <li>⚖️ <strong>Weigh</strong> calorie-dense staples you eat often (nuts, oils, rice)</li>
        </ul>
      </div>

      <h2>Database Coverage Problem</h2>

      <p>
        Barcode scanning has a hidden weakness: database gaps. Even the largest food databases 
        are missing:
      </p>

      <ul>
        <li>Regional and store-brand products</li>
        <li>New products not yet added</li>
        <li>International foods</li>
        <li>Anything sold without a barcode (bulk foods, bakery, deli)</li>
      </ul>

      <p>
        When a barcode isn't found, you're back to manual searching — which takes longer than 
        photo tracking would have.
      </p>

      <h2>Sustainability Factor</h2>

      <p>
        The most important question isn't "which is more accurate?" It's "which will you actually use?"
      </p>

      <p>
        Studies show that most people who start macro tracking quit within 2-4 weeks. The #1 reason? 
        It takes too long.
      </p>

      <p>
        Photo tracking removes the biggest friction point: manually searching and measuring. 
        When tracking takes 5 seconds instead of 2 minutes, you're more likely to do it consistently.
      </p>

      <h2>The Verdict</h2>

      <p>
        <strong>Best for packaged foods:</strong> Barcode scanning (exact, fast)
      </p>
      <p>
        <strong>Best for everything else:</strong> Photo tracking (versatile, sustainable)
      </p>
      <p>
        <strong>Best overall strategy:</strong> Use both, depending on the meal
      </p>

      <p>
        For most people eating a mix of packaged foods and prepared meals, photo tracking 
        covers 70-80% of eating situations that barcode scanning can't handle — making it 
        the more practical everyday tool.
      </p>

      <h2>Try Photo Tracking</h2>

      <p>
        Curious how AI photo tracking compares to your current method? <Link to="/" className="text-primary hover:underline">
        Try ProteinLens</Link> on your next meal — snap a photo and see your macros in seconds.
      </p>
    </div>
  );
}
