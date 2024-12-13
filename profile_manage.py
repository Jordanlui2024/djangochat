import cProfile
import pstats
from manage import main

cProfile.run('main()', 'output.prof')

# 查看結果
p = pstats.Stats('output.prof')
p.sort_stats('cumulative').print_stats(20)