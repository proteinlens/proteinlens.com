import React from 'react';
import { Link } from 'react-router-dom';

export default function ProteinInTofu() {
  return (
    <>
      <p>Tofu is the most versatile plant-based protein — but its protein content varies dramatically by type. Silken tofu has barely half the protein of extra-firm. Here's everything you need to know.</p>

      <h2>Tofu Macros by Type (Per 100g)</h2>
      <ul>
        <li><strong>Extra-firm tofu:</strong> 10g protein | 1.5g carbs | 6g fat | 100 cal</li>
        <li><strong>Firm tofu:</strong> 8g protein | 2g carbs | 5g fat | 83 cal</li>
        <li><strong>Soft tofu:</strong> 6g protein | 2g carbs | 3.5g fat | 62 cal</li>
        <li><strong>Silken tofu:</strong> 5g protein | 2g carbs | 2.5g fat | 55 cal</li>
        <li><strong>Smoked tofu:</strong> 12g protein | 1g carbs | 7g fat | 120 cal</li>
        <li><strong>Tempeh:</strong> 19g protein | 9g carbs | 11g fat | 192 cal — fermented, highest protein</li>
      </ul>
      <p>The difference between silken and extra-firm is <strong>double the protein</strong> per 100g. For protein goals, always choose firm or extra-firm.</p>

      <h2>Is Tofu a Complete Protein?</h2>
      <p><strong>Yes.</strong> Soy is one of the few plant proteins containing all 9 essential amino acids in adequate ratios. The PDCAAS (protein quality score) of soy protein is 1.0 — equal to animal proteins like egg and casein.</p>
      <p>This makes tofu nutritionally superior to most other plant proteins (beans, lentils, grains) which are incomplete on their own.</p>

      <h2>How to Get 30g Protein from Tofu</h2>
      <p>You need about <strong>300g extra-firm tofu</strong> — roughly one standard block. That's 300 cal, making it very calorie-efficient for a plant protein.</p>
      <ul>
        <li><strong>Tofu scramble (300g):</strong> 30g protein | 300 cal — press, crumble, season with turmeric + nooch</li>
        <li><strong>Crispy tofu stir-fry:</strong> 200g tofu + edamame + rice = 28g protein | 450 cal</li>
        <li><strong>Tofu curry (250g):</strong> 25g protein | 280 cal base (before coconut milk/rice)</li>
      </ul>

      <h2>Tofu Preparation Tips</h2>
      <ul>
        <li><strong>Press it:</strong> Remove water for better texture — wrap in towels, weight on top, 15-30 minutes</li>
        <li><strong>Freeze then thaw:</strong> Creates a chewier, more meat-like texture. Freezing ruptures cell walls.</li>
        <li><strong>Marinate:</strong> Tofu is a flavor sponge. Soy sauce, ginger, garlic, sriracha — 30 minutes minimum</li>
        <li><strong>Cornstarch coat + air fry:</strong> Crispy outside, soft inside — the best texture for stir-fries</li>
      </ul>

      <h2>Tofu vs. Other Plant Proteins</h2>
      <ul>
        <li><strong>Tofu (extra-firm):</strong> 10g protein / 100g — versatile, complete protein</li>
        <li><strong>Tempeh:</strong> 19g / 100g — fermented, nuttier, highest density</li>
        <li><strong>Seitan:</strong> 25g / 100g — wheat gluten, meat-like texture, not for celiacs</li>
        <li><strong>Edamame:</strong> 11g / 100g — snack-ready, same soy base</li>
        <li><strong>Lentils:</strong> 9g / 100g — cheap, but incomplete protein alone</li>
      </ul>
      <p>Track your tofu meals with <Link to="/">ProteinLens</Link> — AI recognizes different tofu preparations accurately.</p>

      <h2>Soy Safety: Should You Worry?</h2>
      <p>The "soy increases estrogen" fear is largely debunked. Phytoestrogens in soy are <strong>1,000-10,000× weaker than human estrogen</strong>. Meta-analyses show that soy consumption does not affect testosterone or estrogen levels in men (Reed et al., 2021). 2-3 servings per day is considered safe for all populations.</p>

      <h2>Related Guides</h2>
      <ul>
        <li><Link to="/blog/vegan-protein-sources-complete">Complete Vegan Protein Guide</Link></li>
        <li><Link to="/blog/protein-in-beans-and-lentils">Protein in Beans & Lentils</Link></li>
        <li><Link to="/blog/how-much-protein-per-kg">How Much Protein Per Kg?</Link></li>
        <li><Link to="/blog/high-protein-meal-prep">High-Protein Meal Prep</Link></li>
        <li><Link to="/protein-calculator">Free Protein Calculator</Link></li>
      </ul>
    </>
  );
}
