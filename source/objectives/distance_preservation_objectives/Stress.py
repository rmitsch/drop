import scipy
import sklearn
from .DistancePreservationObjective import DistancePreservationObjective
import networkx
from sklearn.isotonic import IsotonicRegression
import numpy as np


class Stress(DistancePreservationObjective):
    """
    Calculates stress criterions (Kruskal's stress, Sammon's stress, S stress, quadratic loss).
    """
    def __init__(
            self,
            low_dimensional_data: np.ndarray,
            high_dimensional_data: np.ndarray,
            use_geodesic_distances: bool = False
    ):
        """
        Initiates new pool for stress-related objectives.
        :param low_dimensional_data:
        :param high_dimensional_data:
        :param use_geodesic_distances:
        """
        super().__init__(
            low_dimensional_data=low_dimensional_data,
            high_dimensional_data=high_dimensional_data,
            use_geodesic_distances=use_geodesic_distances
        )

    def compute(self) -> float:
        """
        This method allows to compute multiple stress functions:
            * Kruskal stress https://www.researchgate.net/publication/24061688_Nonmetric_multidimensional_scaling_A_numerical_method
            * S stress http://gifi.stat.ucla.edu/janspubs/1977/articles/takane_young_deleeuw_A_77.pdf
            * Sammon stress http://ieeexplore.ieee.org/document/1671271/?reload=true
            * Quadratic Loss
        Source: https://github.com/flowersteam/Unsupervised_Goal_Space_Learning/blob/master/src/embqual.py.
        :return: Stress measure.
        """
        
        # We retrieve dimensions of the data
        n, m = self._low_dimensional_data.shape

        #  We compute distance matrices in both spaces
        if self._use_geodesic_distances:
            k: int = 2
            is_connex: bool = False

            while is_connex is False:
                knn = sklearn.neighbors.NearestNeighbors(n_neighbors=k)
                knn.fit(self._low_dimensional_data)
                M = knn.kneighbors_graph(self._low_dimensional_data, mode='distance')
                graph = networkx.from_scipy_sparse_matrix(M)
                is_connex = networkx.is_connected(graph)
                k += 1
            s_uni_distances = networkx.all_pairs_dijkstra_path_length(graph, cutoff=None, weight='weight')
            s_all_distances = np.array([np.array(a.items())[:, 1] for a in np.array(s_uni_distances.items())[:, 1]])
            s_all_distances = (s_all_distances + s_all_distances.T) / 2
            s_uni_distances = scipy.spatial.distance.squareform(s_all_distances)
            s_all_distances = s_all_distances.ravel()

        else:
            s_uni_distances = scipy.spatial.distance.pdist(self._low_dimensional_data)
            s_all_distances = scipy.spatial.distance.squareform(s_uni_distances).ravel()
        l_uni_distances = scipy.spatial.distance.pdist(self._target_data)
        l_all_distances = scipy.spatial.distance.squareform(l_uni_distances).ravel()

        # We set up the measure dict
        measures = dict()

        # 1. Quadratic Loss
        # measures['quadratic_loss'] = numpy.square(s_uni_distances - l_uni_distances).sum()

        # 2. Sammon stress
        # measures['sammon_stress'] = (1 / s_uni_distances.sum()) * (
        #     numpy.square(s_uni_distances - l_uni_distances) / s_uni_distances
        # ).sum()

        # 3. S stress
        # measures['s_stress'] = numpy.sqrt((1 / n) * (
        #     numpy.square(
        #         (numpy.square(s_uni_distances) - numpy.square(l_uni_distances)).sum()
        #     ) / numpy.power(s_uni_distances, 4)
        # )).sum()

        # 4. Kruskal stress
        # We reorder the distances under the order of distances in latent space
        s_all_distances: np.ndarray = s_all_distances[l_all_distances.argsort()]
        l_all_distances: np.ndarray = l_all_distances[l_all_distances.argsort()]
        # We perform the isotonic regression
        iso: IsotonicRegression = IsotonicRegression()
        s_iso_distances: np.ndarray = iso.fit_transform(s_all_distances, l_all_distances)
        # We compute the kruskal stress.
        measures['kruskal_stress'] = np.sqrt(
            np.square(s_iso_distances - l_all_distances).sum() / np.square(l_all_distances).sum()
        )

        # Pick Kruskal's stress here. Best choices amongst Sammon, S, Kruskal, quadratic loss?
        return measures['kruskal_stress']
