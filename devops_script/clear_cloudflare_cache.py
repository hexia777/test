import requests
import json


def cloudflare_clear_cache(token, zone_id, domain_url):
    purge_cache_url = (
        f"https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache"
    )
    data = {
        # "purge_everything": True  //清除所有的缓存，慎用
        # Only enterprise zones can purge by host.
        "hosts": [domain_url]
        # "prefixes": ["test.vanceai.com/workspace"]
        # "files": ["https://test.vanceai.com/workspace/"]
    }

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    response = requests.post(
        purge_cache_url, headers=headers, data=json.dumps(data), verify=False
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}


token = "J2_THvAtYjf0DFZiaNca5gwUOS51GEBjA6HzX1-q"
zone_id = "e347f53d75667278c1d010ec1c4f5fb4"
domain_url = "test.vanceai.com"
response = cloudflare_clear_cache(token, zone_id, domain_url)
print(response)
