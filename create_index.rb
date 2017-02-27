require 'rubygems'
require 'algoliasearch'
require 'csv'
require 'pry'

Algolia.init :application_id => "RQ5R9HF6TL",
             :api_key        => "bc91fd3a9846abb69c9ce9feb04fb2d6"

index = Algolia::Index.new("restaurants")
index.delete_index

json_data = JSON.parse(File.read("resources/dataset/restaurants_list.json"))
csv_data = CSV.read('resources/dataset/restaurants_info.csv', headers: true, col_sep: ';').map { |row| row.to_h }

data = json_data.map do |restaurant|
  extra_data = csv_data.select { |csv| csv['objectID'].to_i == restaurant['objectID'] }
  restaurant.merge(extra_data.first)
end

index.add_objects(data)
index.set_settings({ ranking: ['typo', 'geo', 'words', 'attribute', 'proximity', 'exact', 'custom'], "attributesForFaceting" => ["food_type", "stars_count", "payment_options"]})
