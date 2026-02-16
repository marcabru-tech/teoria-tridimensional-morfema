"""
3D Visualization for the Morpheme Space.

Uses Plotly for interactive 3D scatter plots and heatmaps.
"""

from __future__ import annotations

from typing import List, Optional

try:
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots

    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False

from ttm.core.morpheme import Morpheme
from ttm.core.space import MorphemeSpace


class MorphemeVisualizer:
    """Interactive 3D visualizer for morpheme spaces.

    Requires plotly to be installed (`pip install plotly`).
    """

    def __init__(self):
        if not HAS_PLOTLY:
            raise ImportError(
                "plotly is required for visualization. "
                "Install with: pip install plotly"
            )

    def plot_morpheme_space(
        self,
        morphemes: List[Morpheme],
        title: str = "Morpheme Space (3D)",
        save_path: Optional[str] = None,
        show: bool = True,
    ) -> Optional[go.Figure]:
        """Create an interactive 3D scatter plot of morphemes.

        Args:
            morphemes: List of morphemes to plot.
            title: Plot title.
            save_path: Optional file path to save the plot (HTML).
            show: Whether to display the plot.

        Returns:
            The plotly Figure object.
        """
        if not morphemes:
            return None

        coords = [m.coordinates for m in morphemes]
        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]
        zs = [c[2] for c in coords]

        labels = [f"{m.form} ({m.gloss})" if m.gloss else m.form for m in morphemes]
        hover_texts = [
            f"Form: {m.form}<br>"
            f"Root: {m.root}<br>"
            f"Gloss: {m.gloss}<br>"
            f"Coords: ({c[0]}, {c[1]}, {c[2]})"
            for m, c in zip(morphemes, coords)
        ]

        fig = go.Figure(
            data=[
                go.Scatter3d(
                    x=xs,
                    y=ys,
                    z=zs,
                    mode="markers+text",
                    text=labels,
                    textposition="top center",
                    textfont=dict(size=10),
                    hovertext=hover_texts,
                    hoverinfo="text",
                    marker=dict(
                        size=8,
                        color=zs,
                        colorscale="Viridis",
                        opacity=0.8,
                        colorbar=dict(title="Height (Z)"),
                    ),
                )
            ]
        )

        fig.update_layout(
            title=title,
            scene=dict(
                xaxis_title="Largura (X) — Derivação",
                yaxis_title="Profundidade (Y) — Semântica",
                zaxis_title="Altura (Z) — Suprassegmental",
            ),
            font=dict(family="Arial, sans-serif"),
            width=900,
            height=700,
        )

        if save_path:
            fig.write_html(save_path)

        if show:
            fig.show()

        return fig

    def plot_depth_heatmap(
        self,
        morphemes: List[Morpheme],
        title: str = "Semantic Depth Map",
        save_path: Optional[str] = None,
        show: bool = True,
    ) -> Optional[go.Figure]:
        """Create a 2D heatmap of morphemes by Width (X) and Depth (Y).

        Args:
            morphemes: List of morphemes to plot.
            title: Plot title.
            save_path: Optional file path to save.
            show: Whether to display the plot.

        Returns:
            The plotly Figure object.
        """
        if not morphemes:
            return None

        coords = [m.coordinates for m in morphemes]
        xs = [c[0] for c in coords]
        ys = [c[1] for c in coords]
        labels = [m.form for m in morphemes]

        fig = go.Figure(
            data=[
                go.Scatter(
                    x=xs,
                    y=ys,
                    mode="markers+text",
                    text=labels,
                    textposition="top center",
                    marker=dict(size=12, color=ys, colorscale="RdYlBu"),
                )
            ]
        )

        fig.update_layout(
            title=title,
            xaxis_title="Largura (X) — Derivação",
            yaxis_title="Profundidade (Y) — Semântica",
            width=800,
            height=500,
        )

        if save_path:
            fig.write_html(save_path)

        if show:
            fig.show()

        return fig


def quick_plot(space: MorphemeSpace, **kwargs) -> Optional[go.Figure]:
    """Quick convenience function to visualize a MorphemeSpace.

    Args:
        space: The MorphemeSpace to visualize.
        **kwargs: Additional arguments passed to plot_morpheme_space.

    Returns:
        The plotly Figure, or None if plotly is not installed.
    """
    if not HAS_PLOTLY:
        print("plotly is required for visualization. Install with: pip install plotly")
        return None

    viz = MorphemeVisualizer()
    return viz.plot_morpheme_space(space.morphemes, **kwargs)
