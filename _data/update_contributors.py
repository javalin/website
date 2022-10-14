import requests
import json
# Get all repositories from the javalin organization using the GitHub API
# https://developer.github.com/v3/repos/#list-organization-repositories

repos = requests.get('https://api.github.com/orgs/javalin/repos?per_page=100').json()

print('Found {} repositories'.format(len(repos)))

# Get all contributors from all non-forked repositories using the GitHub API, summing the contributions for each user. Save the whole user object in a dict.

contributors = {}

for repo in (r for r in repos if r['fork'] == False):
    repo_contributors = requests.get(repo['contributors_url'] + '?per_page=100').json()
    # Parse json contributor object
    for contributor in repo_contributors:
        if contributor['type'] == 'User':
            if contributor['login'] in contributors:
                contributors[contributor['login']]['contributions'] += contributor['contributions']
            else:
                contributors[contributor['login']] = contributor

print('Found {} contributors'.format(len(contributors)))

# save the top 15 contributors by number of contributions into a json file called contributors.json
top_contributors = sorted(contributors.values(), key=lambda c: c['contributions'], reverse=True)[:15]

with open('contributors.json', 'w') as f:
    json.dump(top_contributors, f)

#Print the top 15 contributors
for contributor in top_contributors:
    print(contributor['login'], contributor['contributions'])

print('-' * 40)
print('Top 15 contributors saved')