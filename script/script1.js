// https://observablehq.com/d/390b99c8e9e2616d@369
import define1 from "./script2.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Flow-o-Matic

Edit the textarea below to update the [Sankey diagram](/@d3/sankey-diagram)!`
)});
  main.variable(observer("viewof inputOrder")).define("viewof inputOrder", ["html"], function(html)
{
  const form = html`<form><label><input name=i type=checkbox checked> Preserve input order</label>`;
  form.i.onclick = () => (form.value = form.i.checked, form.dispatchEvent(new CustomEvent("input")));
  form.value = form.i.checked;
  return form;
}
);
  main.variable(observer("inputOrder")).define("inputOrder", ["Generators", "viewof inputOrder"], (G, _) => G.input(_));
  main.variable(observer("viewof align")).define("viewof align", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=left>Left-aligned
  <option value=right>Right-aligned
  <option value=center>Centered
  <option value=justify selected>Justified
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("align") || "justify"
})
)});
  main.variable(observer("align")).define("align", ["Generators", "viewof align"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","DOM","width","height","sankey","data","color"], function(d3,DOM,width,height,sankey,data,color)
{
  const svg = d3.select(DOM.svg(width, height))
      .style("background", "#fff")
      .style("width", "100%")
      .style("height", "auto");

  const {nodes, links} = sankey({
    nodes: data.nodes.map(d => Object.assign({}, d)),
    links: data.links.map(d => Object.assign({}, d))
  });

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0 + 1)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0 - 2)
      .attr("fill", d => {
        let c;
        for (const link of d.sourceLinks) {
          if (c === undefined) c = link.color;
          else if (c !== link.color) c = null;
        }
        if (c === undefined) for (const link of d.targetLinks) {
          if (c === undefined) c = link.color;
          else if (c !== link.color) c = null;
        }
        return (d3.color(c) || d3.color(color)).darker(0.5);
      })
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  const link = svg.append("g")
      .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("g")
      .attr("stroke", d => d3.color(d.color) || color)
      .style("mix-blend-mode", "multiply");

  link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", d => Math.max(1, d.width));

  link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
    .append("tspan")
      .attr("fill-opacity", 0.7)
      .text(d => ` ${d.value.toLocaleString()}`);

  return svg.node();
}
);
  main.variable(observer()).define(["html","DOM","rasterize","chart","serialize"], async function(html,DOM,rasterize,chart,serialize){return(
html`
${DOM.download(await rasterize(chart), "flow-o-matic", "Download as PNG")}
${DOM.download(await serialize(chart), "flow-o-matic", "Download as SVG")}
`
)});
  main.variable(observer("viewof source")).define("viewof source", ["html"], function*(html)
{ 
  const textarea = html`<textarea spellcheck="false">Root,Cancers and Other Neoplasms,50,#992b62,
Root,Immune System Diseases,50,#405752
Cancers and Other Neoplasms,Breast Cancer,50,#992b62
Breast Cancer,Rehabilitation After Breast Cancer,5,#b33e5f
Breast Cancer,Imaging With [11C]Martinostat in Breast Cancer,5,#b64d8f
Breast Cancer,[18F] F-GLN by PET/CT in Breast Cancer,5,#ea688e
Breast Cancer,Individualizing Surveillance Mammography for Older Breast Cancer Survivors,5,#e86fbc
Breast Cancer,Elevate! : An Elderly Breast Cancer Cohort Study,5,#d13c5d
Breast Cancer,Olaparib + Sapacitabine in BRCA Mutant Breast Cancer,5,#b72875
Breast Cancer,Topical Calcipotriene Treatment for Breast Cancer Immunoprevention,5,#e53a8a
Breast Cancer,"Young, Empowered & Strong (YES): The Young Women's Breast Cancer Study 2- Focus on Intervention Pilot",5,#cd35a1
Breast Cancer,Supine MRI in Breast Cancer Patients Receiving Neoadjuvant Therapy,5,#ea2c68
Immune System Diseases,"Diabetes Mellitus, Type 1",50,#405752
"Diabetes Mellitus, Type 1",Carbohydrate Content in the Diet in Type 1 Diabetes,5,#396d64
"Diabetes Mellitus, Type 1",ATG-GCSF in New Onset Type 1 Diabetes,5,#576f6a
"Diabetes Mellitus, Type 1",Albiglutide Versus Placebo in Insulin-treated Subjects With New-onset Type 1 Diabetes Mellitus,5,#3c795f
"Diabetes Mellitus, Type 1",A Study of Effects of Canagliflozin as Add-on Therapy to Insulin in the Treatment of Participants With Type 1 Diabetes Mellitus (T1DM),5,#339c6b
"Diabetes Mellitus, Type 1",Cellular Therapy for Type 1 Diabetes Using Mesenchymal Stem Cells,5,#839c97
"Diabetes Mellitus, Type 1","Sleep, Coping and Executive Functioning in Youth With Type 1 Diabetes",5,#5ea597
"Diabetes Mellitus, Type 1",Efficacy of Coenzyme q10 in Pediatrics With Type 1 Diabetes Mellitus,5,#59c1a0
"Diabetes Mellitus, Type 1",PK/PD Biosimilarity Study of Gan & Lee Insulin Glargine Injection vs.US & EU Lantus® in Type 1 Diabetes Mellitus Patients,5,#57e7a4
"Diabetes Mellitus, Type 1",Physical Activity Monitoring Paediatric Type 1 Diabetes,5,#6fe7d7
"Diabetes Mellitus, Type 1",Safety/Efficacy Study of Subcutaneously Injected Prandial Insulins Compared to Insulin Lispro Alone in Participants With Type 1 Diabetes Mellitus,5,#b4ddcd`;
  textarea.style.display = "block";
  textarea.style.boxSizing = "border-box";
  textarea.style.width = "calc(100% + 28px)";
  textarea.style.font = "var(--mono_fonts)";
  textarea.style.minHeight = "60px";
  textarea.style.border = "none";
  textarea.style.padding = "4px 10px";
  textarea.style.margin = "0 -14px";
  textarea.style.background = "rgb(247,247,249)";
  textarea.style.tabSize = 2;
  textarea.oninput = () => {
    textarea.style.height = "initial";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  yield textarea;
  textarea.oninput();
}
);
  main.variable(observer("source")).define("source", ["Generators", "viewof source"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`Each line in the textarea above represents a link in the chart. The source and target of the link are determined by the two names. (The contents of the textarea are interpreted as [CSV](https://en.wikipedia.org/wiki/Comma-separated_values), so put quotes around names if you want them to contain commas.) The thickness of the link is determined by the following value. You can also specify a fill color after the number.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Appendix`
)});
  main.variable(observer("data")).define("data", ["d3","source","color"], function(d3,source,color)
{
  const links = d3.csvParseRows(source, ([source, target, value, linkColor = color]) => (source && target ? {source, target, value: !value || isNaN(value = +value) ? 1 : value, color: linkColor} : null));
  const nodeByName = new Map;
  for (const link of links) {
    if (!nodeByName.has(link.source)) nodeByName.set(link.source, {name: link.source});
    if (!nodeByName.has(link.target)) nodeByName.set(link.target, {name: link.target});
  }
  return {nodes: Array.from(nodeByName.values()), links};
}
);
  main.variable(observer("sankey")).define("sankey", ["d3","align","inputOrder","padding","width","height"], function(d3,align,inputOrder,padding,width,height){return(
d3.sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
    .nodeSort(inputOrder ? null : undefined)
    .nodeWidth(15)
    .nodePadding(padding)
    .extent([[0, 5], [width, height - 5]])
)});
  main.variable(observer("width")).define("width", function(){return(
954
)});
  main.variable(observer("viewof height")).define("viewof height", ["html"], function(html)
{
  const form = html`<form class="observablehq--inspect">height = <input name=i type=number min=0 value=720 step=1  style="padding:2px;margin:-2px 0;width:120px;"></form>`;
  (form.oninput = () => form.value = form.i.valueAsNumber)();
  return form;
}
);
  main.variable(observer("height")).define("height", ["Generators", "viewof height"], (G, _) => G.input(_));
  main.variable(observer("viewof padding")).define("viewof padding", ["html"], function(html)
{
  const form = html`<form class="observablehq--inspect">padding = <input name=i type=number min=0 value=10 step=1  style="padding:2px;margin:-2px 0;width:120px;"></form>`;
  (form.oninput = () => form.value = form.i.valueAsNumber)();
  return form;
}
);
  main.variable(observer("padding")).define("padding", ["Generators", "viewof padding"], (G, _) => G.input(_));
  main.variable(observer("viewof color")).define("viewof color", ["html"], function(html)
{
  const form = html`<form class="observablehq--inspect">color = <input name=i type=color value="#dddddd" style="padding:2px;margin:-2px 0;"></form>`;
  (form.oninput = () => form.value = form.i.value)();
  return form;
}
);
  main.variable(observer("color")).define("color", ["Generators", "viewof color"], (G, _) => G.input(_));
  const child1 = runtime.module(define1);
  main.import("rasterize", child1);
  main.import("serialize", child1);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-sankey@0.12")
)});
  return main;
}
