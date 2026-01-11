import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode } from 'd3-sankey'
import { SimulationMetrics } from '../../types/simulation'

interface SankeyDiagramProps {
  metrics: SimulationMetrics
}

interface PowerFlowNode {
  name: string
  category: string
}

interface PowerFlowLink {
  source: number
  target: number
  value: number
}

export function SankeyDiagram({ metrics }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 800
    const height = 500
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;')

    // Define nodes
    const nodes: PowerFlowNode[] = [
      { name: 'Grid Supply', category: 'source' },
      { name: 'Transformer', category: 'distribution' },
      { name: 'UPS', category: 'distribution' },
      { name: 'PDU', category: 'distribution' },
      { name: 'IT Equipment', category: 'load' },
      { name: 'Cooling System', category: 'load' },
      { name: 'Distribution Losses', category: 'loss' },
    ]

    // Calculate power flows
    const gridSupply = metrics.total_power_kw
    const transformerLoss = metrics.distribution_losses_kw * 0.3  // Assume 30% of losses from transformer
    const upsLoss = metrics.distribution_losses_kw * 0.6  // Assume 60% of losses from UPS
    const pduLoss = metrics.distribution_losses_kw * 0.1  // Assume 10% of losses from PDU

    const afterTransformer = gridSupply - transformerLoss
    const afterUPS = afterTransformer - upsLoss

    // Define links
    const links: PowerFlowLink[] = [
      // Grid to Transformer
      { source: 0, target: 1, value: gridSupply },
      // Transformer to UPS
      { source: 1, target: 2, value: afterTransformer },
      // Transformer to Losses
      { source: 1, target: 6, value: transformerLoss },
      // UPS to PDU
      { source: 2, target: 3, value: afterUPS },
      // UPS to Losses
      { source: 2, target: 6, value: upsLoss },
      // PDU to IT Equipment
      { source: 3, target: 4, value: metrics.it_power_kw },
      // PDU to Cooling
      { source: 3, target: 5, value: metrics.cooling_power_kw },
      // PDU to Losses
      { source: 3, target: 6, value: pduLoss },
    ]

    // Create sankey generator
    const sankeyGenerator = sankey<PowerFlowNode, PowerFlowLink>()
      .nodeWidth(20)
      .nodePadding(30)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

    // Generate the sankey diagram
    const graph: SankeyGraph<PowerFlowNode, PowerFlowLink> = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    })

    // Color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['source', 'distribution', 'load', 'loss'])
      .range(['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'])

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => {
        const sourceNode = d.source as SankeyNode<PowerFlowNode, PowerFlowLink>
        return colorScale(sourceNode.category || 'distribution')
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.4)
      .append('title')
      .text((d: any) => {
        const source = (d.source as SankeyNode<PowerFlowNode, PowerFlowLink>).name
        const target = (d.target as SankeyNode<PowerFlowNode, PowerFlowLink>).name
        return `${source} → ${target}\n${d.value.toFixed(1)} kW`
      })

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g')

    node.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => colorScale(d.category || 'distribution'))
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .append('title')
      .text((d: any) => `${d.name}\n${d.value?.toFixed(1) || 0} kW`)

    // Add labels
    node.append('text')
      .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', (d: any) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .text((d: any) => `${d.name} (${d.value?.toFixed(1) || 0} kW)`)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${height - 100})`)

    const categories = [
      { name: 'Source', color: colorScale('source') },
      { name: 'Distribution', color: colorScale('distribution') },
      { name: 'IT Load', color: colorScale('load') },
      { name: 'Losses', color: colorScale('loss') },
    ]

    categories.forEach((cat, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`)

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', cat.color)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text(cat.name)
    })

  }, [metrics])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="mx-auto" />
    </div>
  )
}
